"""The island test, and the measurement that corrects archaeology 008.

    python src/island_test.py

Section 4 is why this entry exists. Archaeology 008 reported that logging's
deprecated alias "emits one DeprecationWarning". It does — once per call site
per process. My observer saw it every time because the observer resets the
channel's memory as a side effect of isolating itself.
"""
import inspect
import io
import json
import pathlib
import re
import sys
import warnings

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE))

from SCL import policy  # noqa: E402
from SMS.channel import Channel  # noqa: E402
from TMS.observers import passive, resetting  # noqa: E402

RECORD = json.loads((HERE / "FMS" / "architecture.json").read_text(encoding="utf-8"))
FAILURES = []


def check(label, ok, detail=""):
    print(f"  {'PASS' if ok else 'FAIL'}  {label}{' - ' + detail if detail else ''}")
    if not ok:
        FAILURES.append(label)


print("\n== 1. each observer is an island, and declares whether it perturbs")
for module in (passive, resetting):
    source = (HERE / "TMS" / "observers" / f"{module.NAME}.py").read_text(encoding="utf-8")
    reaches = re.findall(r"^\s*(?:from|import)\s+(\S+)", source, re.M)
    check(f"observers/{module.NAME} imports nothing", not reaches, ", ".join(reaches) or "none")
    declared = RECORD["observers"][module.NAME]["perturbs_the_channel"]
    check(f"observers/{module.NAME} agrees with the record about perturbing",
          module.PERTURBS == declared, f"module says {module.PERTURBS}, record says {declared}")

print("\n== 2. the same code, two observers, different numbers")
ch = Channel()
send = lambda: ch.send("a.py:1", "notice")  # noqa: E731
seen_passive = passive.observe(ch, lambda: [send() for _ in range(5)])
seen_reset = resetting.observe(ch, send, lambda: ch.clear_memory("test-harness", policy.may_clear), times=5)
check("passive sees the notice once out of five", len(seen_passive["delivered"]) == 1,
      f"{len(seen_passive['delivered'])} of 5")
check("resetting sees it five times out of five", len(seen_reset["delivered"]) == 5,
      f"{len(seen_reset['delivered'])} of 5")
check("and the code did exactly the same thing both times", len(ch.attempted) == 10,
      f"{len(ch.attempted)} attempts, {len(ch.delivered)} delivered, {ch.suppressed()} suppressed")

print("\n== 3. the checks can fail")
ch2 = Channel()
refused = resetting.observe(ch2, lambda: ch2.send("b.py:1", "x"),
                            lambda: ch2.clear_memory("nobody", policy.may_clear), times=3)
check("an actor policy does not permit cannot clear the memory",
      refused.get("refused") is not None, refused.get("refused", ""))
check("and the refusal is recorded on the channel",
      ("nobody", "refused") in ch2.clears, str(ch2.clears))
ch3 = Channel()
ch3.send("c.py:1", "first")
ch3.send("c.py:1", "first")
ch3.send("c.py:2", "first")
check("the memory is keyed by source AND text, not by text alone",
      len(ch3.delivered) == 2, f"{len(ch3.delivered)} delivered from 3 sends")

print("\n== 4. measured against CPython warnings 3.14.5 itself")
check("this interpreter is the examined version", sys.version.split()[0] == "3.14.5",
      sys.version.split()[0])

facade = pathlib.Path(inspect.getsourcefile(warnings))
facade_lines = len(facade.read_text(encoding="utf-8").splitlines())
check("the module you import is a 99-line facade", facade_lines == 99, f"{facade_lines} lines")

import _py_warnings  # noqa: E402
impl = pathlib.Path(inspect.getsourcefile(_py_warnings))
impl_lines = len(impl.read_text(encoding="utf-8").splitlines())
check("the pure-Python implementation is elsewhere and far larger",
      impl_lines > 800, f"_py_warnings.py = {impl_lines} lines")
check("and warn() actually comes from the C module",
      warnings.warn.__module__ == "_warnings", warnings.warn.__module__)

import _warnings  # noqa: E402
check("the facade's filter list IS the C module's", warnings.filters is _warnings.filters,
      "the observation and the observed are the same object")

# The memory, measured without an instrument that resets it.
captured = []
warnings.showwarning = lambda message, category, filename, lineno, file=None, line=None: \
    captured.append((category.__name__, str(message)))
warnings.simplefilter("default")


def emit():
    warnings.warn("a deprecated thing", DeprecationWarning, stacklevel=2)


before = len(captured)
for _ in range(5):
    emit()
uninstrumented = len(captured) - before
check("five calls from one site emit ONE warning", uninstrumented == 1,
      f"{uninstrumented} of 5 — the channel remembers")

registry = sys.modules["__main__"].__dict__.get("__warningregistry__", {})
check("and the memory is visible as __warningregistry__",
      any(isinstance(k, tuple) for k in registry), str(registry)[:70])

instrumented = 0
for _ in range(5):
    with warnings.catch_warnings(record=True) as w:
        warnings.simplefilter("always")
        emit()
        instrumented += len(w)
check("the same five calls, each wrapped, emit FIVE", instrumented == 5,
      f"{instrumented} of 5 — catch_warnings mutates the filters and every registry is discarded")
check("so the instrument changed the channel it was measuring",
      uninstrumented == 1 and instrumented == 5,
      "1 vs 5 from identical code — this is archaeology 008's observer")

print("\n== 5. the correction this forces on archaeology 008")
prior = pathlib.Path(HERE / ".." / ".." / "008-cpython-logging-warn" / "src" / "FMS" / "architecture.json").resolve()
if prior.exists():
    prior_record = json.loads(prior.read_text(encoding="utf-8"))
    permit = prior_record["compatibility_aliases"][0]["equivalence"]["allowed_deltas"][0]
    check("archaeology 008's permit is still stated as 'one DeprecationWarning'",
          "one-deprecation-warning" in str(permit.get("predicate", "")), str(permit))
    check("and that is true only under a resetting observer",
          uninstrumented == 1,
          "a passive observer sees one on the FIRST call from a site and none after")
    observer = prior_record["observers"]["three-channel-v1"]
    check("008's observer now names this in what it cannot see",
          "memory" in observer["what_it_cannot_see"] or "registry" in observer["what_it_cannot_see"],
          observer["what_it_cannot_see"][:80])
else:
    check("archaeology 008 is on disk to be corrected", False, str(prior))

print("\n== 6. what this entry does not claim")
check("the record does not call CPython wrong",
      "not about it" in RECORD["non_goals"][1], RECORD["non_goals"][1][:70])
check("once-per-site is recorded as the correct default for a notice channel",
      "correct default" in RECORD["non_goals"][1])

print("")
if FAILURES:
    print(f"  {len(FAILURES)} check(s) failed: {', '.join(FAILURES)}")
    raise SystemExit(1)
print("  island test passed")
