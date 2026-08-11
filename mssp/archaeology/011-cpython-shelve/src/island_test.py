"""The island test, and the drills that let each comparison come out false.

    python src/island_test.py

Section 3 compares the re-cut against the shelve running right now. Section 3b
breaks the re-cut on purpose so that comparison is a measurement rather than a
formality, and section 2b mislabels a handout so the declaration check is too.
"""
import pathlib
import pickle
import re
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE))

from SCL import policy  # noqa: E402
from SMS import shelf, upstream  # noqa: E402

FAILURES = []


def check(label, ok, detail=""):
    print(f"  {'PASS' if ok else 'FAIL'}  {label}{' - ' + detail if detail else ''}")
    if not ok:
        FAILURES.append(label)


LOADED, PROBLEMS = shelf.load_handouts()


def through_recut(module):
    backing = {}
    store = shelf.Shelf(backing, module)
    store["cart"] = ["apple"]
    reopened = shelf.Shelf(backing, module)
    reopened["cart"].append("pear")
    separates = shelf.hands_back_copies(reopened, "cart")
    held = reopened.held()
    reopened.sync()
    survived = pickle.loads(backing[b"cart"])
    return {"mutation_survives": survived == ["apple", "pear"],
            "identity_separates": separates, "held": held}


print("\n== 1. every handout is an island and declares what it hands back")
check("both handouts loaded with no problems", not PROBLEMS, "; ".join(PROBLEMS))
handout_dir = HERE / "TMS" / "handouts"
files = sorted(f for f in handout_dir.iterdir() if f.suffix == ".py" and f.name != "__init__.py")
check("there are two handout files", len(files) == 2, ", ".join(f.stem for f in files))
for f in files:
    reaches = re.findall(r"^\s*(?:from|import)\s+(\S+)", f.read_text(encoding="utf-8"), re.M)
    siblings = [r for r in reaches if r.split(".")[0] in {"TMS", "SMS", "SCL", "DMS", "FMS"}]
    check(f"{f.stem} reaches no sibling set", not siblings,
          ", ".join(reaches) or "no imports at all")
for name, module in sorted(LOADED.items()):
    check(f"{name} says what it hands back", bool(module.HANDS_BACK), module.HANDS_BACK)

print("\n== 2. the declaration is checked by running it, not by reading it")
for name, module in sorted(LOADED.items()):
    measured = through_recut(module)
    check(f"{name}: declared mutation_survives={module.MUTATION_SURVIVES}, measured "
          f"{measured['mutation_survives']}",
          measured["mutation_survives"] == module.MUTATION_SURVIVES)

print("\n== 2b. the drill: a handout that lies about itself must be caught")


class Mislabelled:
    NAME = "mislabelled"
    HANDS_BACK = "a fresh object on every read"
    MUTATION_SURVIVES = False          # the lie
    make = staticmethod(LOADED["cached-reference"].make)   # the behaviour


measured = through_recut(Mislabelled)
check("a handout declaring copy semantics while caching is caught",
      measured["mutation_survives"] != Mislabelled.MUTATION_SURVIVES,
      f"declared {Mislabelled.MUTATION_SURVIVES}, measured {measured['mutation_survives']}")

print("\n== 3. the re-cut against the shelve running right now")
CELLS = []
for writeback, handout_name in ((False, "copy-on-read"), (True, "cached-reference")):
    measured = upstream.probe(writeback)
    modelled = through_recut(LOADED[handout_name])
    for field in ("mutation_survives", "identity_separates"):
        CELLS.append({"writeback": writeback, "field": field,
                      "upstream": measured[field], "recut": modelled[field]})
agree = [c for c in CELLS if c["upstream"] == c["recut"]]
check(f"all {len(CELLS)} cells agree", len(agree) == len(CELLS),
      f"{len(agree)}/{len(CELLS)}")

print("\n== 3b. the drill: can that comparison come out false?")


class Swapped:
    NAME = "swapped"
    HANDS_BACK = "wrong on purpose"
    MUTATION_SURVIVES = False
    make = staticmethod(LOADED["cached-reference"].make)


broken = through_recut(Swapped)
against_default = upstream.probe(False)
check("using the wrong strategy for writeback=False breaks cells",
      any(broken[f] != against_default[f] for f in ("mutation_survives", "identity_separates")),
      "so section 3 is a measurement, not a formality")

print("\n== 4. the flag is named for its fourth consequence")
marks = upstream.cache_after_pure_reads(200)
check("200 pure reads retain 200 objects", marks.get(200) == 200,
      ", ".join(f"{k} reads -> {v} held" for k, v in sorted(marks.items())))
# The previous version of this line was `check(..., True, ...)` - an assertion
# that the read loop wrote nothing. That is the hardcoded-True defect this lab
# filed against archaeology 008 on 2026-08-08, and measuring it disagrees.
under_writeback = upstream.reads_cause_writes(200, writeback=True)
under_default = upstream.reads_cause_writes(200, writeback=False)
check("a READ-ONLY session under writeback rewrites the medium at close",
      bool(under_writeback["changed"]),
      f"{len(under_writeback['changed'])} of {under_writeback['files']} files changed: "
      f"{', '.join(under_writeback['changed'])}")
check("the same read-only session under the default does not",
      not under_default["changed"],
      f"{under_default['unchanged']} of {under_default['files']} files unchanged")
check("so the two differ, which is what makes either mean anything",
      bool(under_writeback["changed"]) != bool(under_default["changed"]))

print("\n== 5. what answers the same however it went")
values = upstream.returns_nothing_discriminating()
same = [label for label, value in values.items() if value is None]
check("three operations return None on every path", len(same) == 3, ", ".join(same))
check("and the one observation that does discriminate is identity",
      values["get('a') is a live ref"] is False,
      "under the default, two reads of one key are two objects")

print("\n== 6. fail closed")
_, problem = shelf.resolve("write-through", LOADED)
check("an unresolvable handout stops the run", problem is not None, problem or "resolved anyway")
check("SCL names a handout that exists", policy.handout() in LOADED, policy.handout())

print("\n== 7. what this entry cannot see")
print("        MEASURABLE, NOT MEASURED")
print("          - how often real code mutates what a shelf handed it")
print("          - what the retained objects cost on a session-sized workload")
print("        NOT MEASURABLE HERE")
print("          - whether the default is wrong. It is off, documented, and turning")
print("            it on costs memory most callers do not want to spend.")
print("          - frequency in the wild. Reproducing a silent loss says nothing")
print("            about how often anyone meets it.")

print(f"\n{len(FAILURES)} failure(s)" if FAILURES else "\nall checks passed")
for f in FAILURES:
    print(f"  - {f}")
sys.exit(1 if FAILURES else 0)
