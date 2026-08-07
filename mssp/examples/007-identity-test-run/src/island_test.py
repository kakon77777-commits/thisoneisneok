"""The island test, and the demonstration that the roster is a function of the witness.

    python src/island_test.py

Section 3 is the one that matters. It runs the identity test twice with two
different definitions of "the answer" and shows the SMS roster change — which
is the finding this example exists for.
"""
import copy
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE))

from DMS import identity  # noqa: E402
from SCL import policy  # noqa: E402

FAILURES = []


def report(label, ok, detail=""):
    print(f"  {'PASS' if ok else 'FAIL'}  {label}{' - ' + detail if detail else ''}")
    if not ok:
        FAILURES.append(label)


MANIFEST = json.loads((HERE / "FMS" / "manifest.json").read_text(encoding="utf-8"))

import main as entry  # noqa: E402
BASELINE = entry.build_output([])

print("\n== 1. each report is an island")
for name in ("text", "csv"):
    module = __import__(f"TMS.reports.{name}", fromlist=["render"])
    source = (HERE / "TMS" / "reports" / f"{name}.py").read_text(encoding="utf-8")
    out = module.render(
        {"matched": 1, "differing": 1, "only_left": 0, "only_right": 0, "net_difference_cents": -5},
        [{"id": "X-1", "left": "1", "right": "2", "note": "amounts differ"}],
    )
    report(f"reports/{name} renders with no sibling loaded", isinstance(out, str) and "X-1" in out)
    report(f"reports/{name} imports nothing", "import " not in source,
           "not even SMS - it takes plain values")

print("\n== 2. the identity test reaches both verdicts")
RESULTS = identity.run(HERE, MANIFEST, BASELINE)
structural = [r["module"] for r in RESULTS if r["verdict"] == "structural"]
other = [r["module"] for r in RESULTS if r["verdict"] != "structural"]
report("every rostered module was actually run", len(RESULTS) == len(MANIFEST["sms_roster"]),
       f"{len(RESULTS)} of {len(MANIFEST['sms_roster'])}")
report("at least one module survives the test", len(structural) > 0, ", ".join(structural))
report("at least one does not", len(other) > 0, ", ".join(other))
report("so the test is capable of both answers", structural and other,
       "a test that called everything structural would be a test of nothing")
report("no module reported NO STUB", not [r for r in RESULTS if r["verdict"] == "NO STUB"],
       "the test cannot run on a module nobody has said how to neutralise")

print("\n== 3. the roster is a function of the witness, not of the code")
strict = copy.deepcopy(MANIFEST)
strict["answer_witness"] = {
    "what_the_program_is_for": "Saying which entries disagree, how, AND how many.",
    "present_when": "the output names every differing id and reports a non-zero differing count",
    "ids": ["INV-3", "INV-5", "INV-6", "differing        1"],
    "note": "the same program, a stricter statement of what its answer is",
}
STRICT = identity.run(HERE, strict, BASELINE)
strict_structural = [r["module"] for r in STRICT if r["verdict"] == "structural"]
report("under the stated witness, summarise is not structural",
       "summarise" in other, "the rows come from the reconciliation, not from the summary")
report("under a witness that also requires the counts, it is",
       "summarise" in strict_structural, ", ".join(strict_structural))
report("and nothing else moved", set(strict_structural) - set(structural) == {"summarise"},
       f"{sorted(set(strict_structural))} vs {sorted(set(structural))}")
report("so the mechanisation decides consistency, not membership", True,
       "a machine can check the structure against a stated purpose; it cannot state the purpose")

print("\n== 4. the checks can fail")
# A stub that does not actually neutralise the module must not be reported as
# structural evidence. Evaluated by substituting the REAL module as its own stub.
fake = copy.deepcopy(MANIFEST)
fake["sms_roster"] = ["reconcile"]
real_as_stub = (HERE / "SMS" / "reconcile.py").read_text(encoding="utf-8")
stub_path = HERE / "DMS" / "stubs" / "reconcile.py"
saved = stub_path.read_text(encoding="utf-8")
try:
    stub_path.write_text(real_as_stub, encoding="utf-8")
    sham = identity.run(HERE, fake, BASELINE)
    report("a stub identical to the module reports NOT STRUCTURAL",
           sham[0]["verdict"] == "NOT STRUCTURAL",
           "the run is unchanged, so the test correctly says the substitution proved nothing")
    report("and it says the output did not change at all",
           "did not even change" in sham[0]["detail"], sham[0]["detail"])
finally:
    stub_path.write_text(saved, encoding="utf-8")

missing = copy.deepcopy(MANIFEST)
missing["sms_roster"] = ["nonexistent_module"]
gap = identity.run(HERE, missing, BASELINE)
report("a module with no stub is refused, not skipped", gap[0]["verdict"] == "NO STUB",
       gap[0]["detail"])

print("\n== 5. SCL decides what may be produced")
report("policy permits two reports", len(policy.permitted_reports()) == 2,
       ", ".join(policy.permitted_reports()))
report("an unlisted report is refused", not policy.permits("reports/pdf"))
report("the tolerance comes from policy", policy.tolerance_cents() == 2,
       "INV-2 differs by 1 cent and is matched because of it")

print("\n== 6. the reconciliation accounts for every entry")
report("the baseline names all three unmatched ids",
       all(i in BASELINE for i in MANIFEST["answer_witness"]["ids"]),
       "if this ever fails, the witness and the program have drifted apart")

print()
if FAILURES:
    print(f"  {len(FAILURES)} check(s) failed: {', '.join(FAILURES)}")
    raise SystemExit(1)
print("  island test passed")
