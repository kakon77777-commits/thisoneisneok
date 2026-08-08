"""The island test, and the live measurement of CPython's own warn alias.

    python src/island_test.py

Section 4 is why this entry exists: mssp-d-001 asked for a rename under a
second host interface, to find out whether one record shape describes both.
It does not — and section 5 shows exactly which field of the schema breaks.
"""
import io
import inspect
import json
import logging
import pathlib
import re
import sys
import warnings

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE))

from DMS import report  # noqa: E402
from SCL import policy  # noqa: E402
from SMS import contract, observe  # noqa: E402
from TMS.emitters import current, legacy  # noqa: E402

RECORD = json.loads((HERE / "FMS" / "architecture.json").read_text(encoding="utf-8"))
ALIAS = RECORD["compatibility_aliases"][0]
OBSERVER = RECORD["observers"][ALIAS["equivalence"]["observer"]]

FAILURES = []


def check(label, ok, detail=""):
    print(f"  {'PASS' if ok else 'FAIL'}  {label}{' - ' + detail if detail else ''}")
    if not ok:
        FAILURES.append(label)


def run_pair():
    before = observe.observe(lambda buf: legacy.emit(buf, "disk almost full", current.emit))
    after = observe.observe(lambda buf: current.emit(buf, "disk almost full"))
    return before, after


print("\n== 1. each emitter is an island")
for name in ("current", "legacy"):
    source = (HERE / "TMS" / "emitters" / f"{name}.py").read_text(encoding="utf-8")
    reaches = re.findall(r"^\s*(?:from|import)\s+(\S+)", source, re.M)
    external = [r for r in reaches if r not in ("warnings",)]
    check(f"emitters/{name} names no sibling", not external, ", ".join(external) or "only the stdlib")
check("the legacy emitter takes its delegate as an argument",
      "delegate" in inspect.signature(legacy.emit).parameters,
      "so the old name calls through without naming the unit it calls")

print("\n== 2. the declaration holds, and for the reason it declared")
before, after = run_pair()
result = contract.check(ALIAS, OBSERVER, before, after,
                        policy.accepts_channel_deltas(), policy.never_differ())
check("the alias holds", result["holds"])
check("output is identical", before["output"] == after["output"], repr(before["output"]))
check("return is identical", before["return"] == after["return"])
check("warnings differ, and the record said they would",
      before["warnings"] != after["warnings"]
      and any(d["channel"] == "warnings" for d in ALIAS["equivalence"]["allowed_deltas"]))
check("and the permission was actually exercised",
      not result["unexercised_permissions"],
      "a permission nothing used would say nothing about whether it was needed")

print("\n== 3. the checks can fail")
strict = contract.check(ALIAS, OBSERVER, before, after,
                        accepts_channel_deltas=False, never_differ=policy.never_differ())
check("a deployment that refuses channel deltas turns the same run into a failure",
      not strict["holds"],
      "same observation, different policy, opposite verdict")
forbidden = contract.check(ALIAS, OBSERVER, before, after,
                           accepts_channel_deltas=True, never_differ=["output", "return", "warnings"])
check("a channel listed as never-differ cannot be waived by allowed_deltas",
      not forbidden["holds"],
      "policy outranks the record for the channels it reserves")
drifted = dict(after)
drifted["output"] = "WARNING:something else\n"
broken = contract.check(ALIAS, OBSERVER, before, drifted,
                        policy.accepts_channel_deltas(), policy.never_differ())
check("an output difference fails, because output is never waivable",
      not broken["holds"],
      [why for ch, ok, why, _ in broken["clauses"] if ch == "output"][0])

print("\n== 4. measured against CPython logging 3.14.5 itself")
check("this interpreter is the examined version", sys.version.split()[0] == "3.14.5",
      sys.version.split()[0])

src = pathlib.Path(inspect.getsourcefile(logging)).read_text(encoding="utf-8")
copies = re.findall(r"def warn\(", src)
check("the alias is hand-written three times", len(copies) == 3,
      "Logger.warn, LoggerAdapter.warn, module-level warn")
stacklevels = set(re.findall(r"DeprecationWarning,\s*(\d+)\)", src))
check("every copy uses the same stacklevel", stacklevels == {"2"}, ", ".join(sorted(stacklevels)))
check("every copy delegates rather than reimplements",
      len(re.findall(r"(?:self\.)?warning\(msg, \*args, \*\*kwargs\)", src)) >= 3,
      "warnings.warn(...) then warning(...)")


def cpython_pair(make_old, make_new):
    def observed(make):
        buf = io.StringIO()
        handler = logging.StreamHandler(buf)
        handler.setFormatter(logging.Formatter("%(levelname)s:%(name)s:%(message)s"))
        log = logging.getLogger("island")
        log.handlers[:] = [handler]
        log.setLevel(logging.DEBUG)
        log.propagate = False
        with warnings.catch_warnings(record=True) as caught:
            warnings.simplefilter("always")
            returned = make(log)
        return {"output": buf.getvalue(),
                "warnings": [(w.category.__name__, str(w.message)) for w in caught],
                "return": repr(returned)}
    return observed(make_old), observed(make_new)


observations = {}
for label, old, new in (
    ("Logger", lambda lg: lg.warn("m %s", 1), lambda lg: lg.warning("m %s", 1)),
    ("LoggerAdapter",
     lambda lg: logging.LoggerAdapter(lg, {}).warn("m %s", 1),
     lambda lg: logging.LoggerAdapter(lg, {}).warning("m %s", 1)),
):
    o, n = cpython_pair(old, new)
    observations[label] = (o, n)
    differing = [c for c in ("output", "warnings", "return") if o[c] != n[c]]
    check(f"{label}: exactly one channel differs", differing == ["warnings"], ", ".join(differing))
    check(f"{label}: and it is the deprecation notice",
          o["warnings"] and o["warnings"][0][0] == "DeprecationWarning" and not n["warnings"],
          o["warnings"][0][1] if o["warnings"] else "none")

# The first version of this line was `check(..., True, ...)` — a hardcoded pass
# in the section measuring whether three hand-written copies had drifted, which
# is the one thing this section exists to find out. Compute it.
logger_delta = {c: observations["Logger"][0][c] != observations["Logger"][1][c]
                for c in ("output", "warnings", "return")}
adapter_delta = {c: observations["LoggerAdapter"][0][c] != observations["LoggerAdapter"][1][c]
                 for c in ("output", "warnings", "return")}
check("the two hand-written copies produce the same delta shape",
      logger_delta == adapter_delta,
      f"Logger {logger_delta} vs LoggerAdapter {adapter_delta}")
check("and their deprecation messages are worded identically",
      observations["Logger"][0]["warnings"][0][1].replace("method", "X")
      == observations["LoggerAdapter"][0]["warnings"][0][1].replace("method", "X"),
      "the duplication has not drifted — measured, not assumed")

print("\n== 5. the schema from mssp-d-001 cannot express this")
draft_allowed_deltas = ["meta.deprecated", "meta.docs.description"]


def resolve(dotted, obj):
    cursor = obj
    for key in dotted.split("."):
        if not isinstance(cursor, dict) or key not in cursor:
            return None
        cursor = cursor[key]
    return cursor


check("the draft's allowed_deltas are dotted FIELD paths",
      all("." in d for d in draft_allowed_deltas), ", ".join(draft_allowed_deltas))
check("and neither resolves against anything here",
      all(resolve(d, before) is None for d in draft_allowed_deltas),
      "the two callables are indistinguishable as objects")
check("the one permitted difference is a channel, not a field",
      isinstance(ALIAS["equivalence"]["allowed_deltas"][0], dict)
      and "channel" in ALIAS["equivalence"]["allowed_deltas"][0],
      json.dumps(ALIAS["equivalence"]["allowed_deltas"][0], ensure_ascii=False))
check("so the second host interface amended the schema rather than breaking the idea",
      RECORD["the_amendment"].startswith("allowed_deltas must name OBSERVATIONS"),
      "a field path is one kind of observation, not the only kind")

print("\n== 6. what this entry does not claim")
check("upstream states no sunset, and that is recorded as absent rather than wrong",
      ALIAS["sunset"].startswith("unstated"), ALIAS["sunset"])
check("the observer names its own blind spot",
      "stacklevel" in OBSERVER["what_it_cannot_see"], OBSERVER["what_it_cannot_see"])

print()
if FAILURES:
    print(f"  {len(FAILURES)} check(s) failed: {', '.join(FAILURES)}")
    raise SystemExit(1)
print("  island test passed")
