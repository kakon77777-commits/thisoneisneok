"""The island test, and the drill that shows the comparison against upstream can fail.

    python src/island_test.py

Section 3 compares the re-cut validator against the interpreter that is running
right now, twelve cells. Section 3b then breaks the re-cut on purpose and
requires the comparison to notice - because a comparison that has never been
seen to fail is a claim, not a check (改良點 6).
"""
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE))

from SCL import policy  # noqa: E402
from SMS import cache, upstream  # noqa: E402

FAILURES = []


def check(label, ok, detail=""):
    print(f"  {'PASS' if ok else 'FAIL'}  {label}{' - ' + detail if detail else ''}")
    if not ok:
        FAILURES.append(label)


LOADED, PROBLEMS = cache.load_validators()
BY_NAME = {module.MODE.lower(): module for module in LOADED.values()}

print("\n== 1. every validator is an island and declares what it reads")
check("all three validators loaded with no problems", not PROBLEMS, "; ".join(PROBLEMS))
validator_dir = HERE / "TMS" / "validators"
files = sorted(f for f in validator_dir.iterdir() if f.suffix == ".py" and f.name != "__init__.py")
check("there are three validator files", len(files) == 3, ", ".join(f.stem for f in files))
for f in files:
    reaches = re.findall(r"^\s*(?:from|import)\s+(\S+)", f.read_text(encoding="utf-8"), re.M)
    check(f"{f.stem} imports nothing", not reaches, ", ".join(reaches) or "no imports at all")
for module in LOADED.values():
    check(f"{module.MODE} says what its evidence is about", bool(module.ABOUT), module.ABOUT)
unconditional = [m for m in LOADED.values() if m.UNCONDITIONAL]
check("exactly one validator declares itself unconditional", len(unconditional) == 1,
      ", ".join(m.MODE for m in unconditional))
check("and it reads nothing at import time, which is why", unconditional[0].READS == [],
      repr(unconditional[0].READS))

print("\n== 2. flags select a validator, and unknown bits do not fall through")
observed = {"mtime": 1000, "size": 10, "hash": (1, 2)}
header = cache.read_header(cache.write_header(0, 1000 & 0xFFFFFFFF, 10))
answers = {}
for flags in (0, 1, 3):
    module, problem = cache.resolve(flags, LOADED)
    answers[flags] = module.is_fresh(header, observed)
check("the same header and state give different answers under different flags",
      len(set(answers.values())) > 1, ", ".join(f"flags {f}={v}" for f, v in answers.items()))
_, problem = cache.resolve(0b100, LOADED)
check("flags outside 0b11 resolve to nothing", problem is not None, problem or "resolved anyway")
_, problem = cache.resolve(2, LOADED)
check("flags=2 (check-source without hash-based) resolves to nothing",
      problem is not None, problem or "resolved anyway")

print("\n== 3. the re-cut against the real interpreter, twelve cells")
CELLS = []
for edit in upstream.EDITS:
    for mode_name in upstream.MODES:
        measured = upstream.probe(edit, mode_name)
        module = BY_NAME[mode_name]
        head = cache.read_header(cache.header_for(module, measured["before"]))
        CELLS.append({"edit": edit["id"], "mode": mode_name, "module": module,
                      "header": head, "before": measured["before"], "after": measured["after"],
                      "upstream_used_cache": measured["ran_stale"],
                      "model_fresh": module.is_fresh(head, measured["after"])})
agree = [c for c in CELLS if c["model_fresh"] == c["upstream_used_cache"]]
check(f"all {len(CELLS)} cells agree", len(agree) == len(CELLS),
      f"{len(agree)}/{len(CELLS)} agree")

print("\n== 3b. the drill: can that comparison come out false?")


def broken_is_fresh(header, observed):
    """timestamp, but comparing the source hash instead of the metadata."""
    return (header["field2"], header["field3"]) == observed["hash"]


broken = [c for c in CELLS if c["mode"] == "timestamp"
          and broken_is_fresh(c["header"], c["after"]) != c["upstream_used_cache"]]
check("swapping timestamp's comparison for the hash one breaks cells", bool(broken),
      f"{len(broken)} of 4 timestamp cells disagree once the rule is wrong")

print("\n== 4. the header the re-cut writes is the header py_compile wrote")
# Two independent producers of the same eight bytes. If these agree it is
# because both read the same source, not because one copied the other.
for mode_name in upstream.MODES:
    measured = upstream.probe(upstream.EDITS[1], mode_name)
    module = BY_NAME[mode_name]
    mine = cache.header_for(module, measured["before"])
    theirs = measured["header"]
    check(f"{mode_name}: bytes 4:16 match py_compile's", mine[4:16] == theirs[4:16],
          f"{mine[4:16].hex()} vs {theirs[4:16].hex()}")

print("\n== 5. how many answers each validator gives, and about what")
for mode_name in upstream.MODES:
    values = sorted({("used" if c["model_fresh"] else "rejected")
                     for c in CELLS if c["mode"] == mode_name})
    module = BY_NAME[mode_name]
    print(f"        {mode_name:<15} {len(values)} answer(s): {', '.join(values):<16} about {module.ABOUT}")
timestamp_values = {c["model_fresh"] for c in CELLS if c["mode"] == "timestamp"}
check("timestamp is not stuck on one answer", len(timestamp_values) == 2,
      "it discriminates - on metadata, which is not the event the import cares about")
unchecked_values = {c["model_fresh"] for c in CELLS if c["mode"] == "unchecked_hash"}
check("unchecked-hash IS stuck on one answer, and declares it",
      len(unchecked_values) == 1 and BY_NAME["unchecked_hash"].UNCONDITIONAL,
      "flags=1 is that declaration, readable by anything")

print("\n== 6. the probe that could not tell two things apart, and its control")
control = upstream.unsupported_flags(0)
unreadable = upstream.unsupported_flags(0b100)
check("with flags=0 the stale cache is used", control["cache_used"], f"ran {control['ran']}")
check("with flags=0b100 the cache is rejected and the source recompiled",
      unreadable["recompiled"], f"ran {unreadable['ran']}")
check("the two runs differ, which is the only reason either means anything",
      control["ran"] != unreadable["ran"], f"{control['ran']} vs {unreadable['ran']}")
check("and neither stops the import - the first version of this probe claimed it did",
      control["exit"] == 0 and unreadable["exit"] == 0,
      f"exits {control['exit']} and {unreadable['exit']}")

print("\n== 7. what this entry cannot see")
print("        MEASURABLE, NOT MEASURED")
print("          - how often a real edit lands inside one mtime second in ordinary work")
print("          - what checked-hash costs on a large import graph")
print("        NOT MEASURABLE HERE")
print("          - whether the default is wrong. Reading every source file at import")
print("            time is a real cost and PEP 552 left timestamp the default. Nothing")
print("            here weighs the two against each other.")
print("          - frequency in the wild. Reproducing a failure says nothing about")
print("            how often anyone meets it.")

print(f"\n{len(FAILURES)} failure(s)" if FAILURES else "\nall checks passed")
for f in FAILURES:
    print(f"  - {f}")
sys.exit(1 if FAILURES else 0)
