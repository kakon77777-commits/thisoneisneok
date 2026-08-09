"""Check that every clause can still be broken, and that nothing stopped watching.

    python src/main.py
    python src/main.py --strict     # exit 1 when policy says an unexplained removal is fatal
"""
import json
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))

from DMS import report  # noqa: E402
from SCL import policy  # noqa: E402
from SMS import continuity, validate  # noqa: E402

HERE = pathlib.Path(__file__).parent
CONTRACT = json.loads((HERE / "FMS" / "contract.json").read_text(encoding="utf-8"))

# Reasons for removing a witness live beside the removal, not in the code that
# checks for it. There is deliberately no reason recorded for the one that was
# dropped, because an example that explains its own counter-example away is not
# demonstrating anything.
REMOVAL_REASONS = {}


def main(argv):
    current = {name: spec["witnesses"] for name, spec in CONTRACT["clauses"].items()}
    previous = CONTRACT["previous_version"]["clauses"]

    clause_reports = [
        continuity.check_clause(name, validate.CLAUSES[name], witnesses)
        for name, witnesses in current.items()
    ]
    continuity_report = continuity.continuity(previous, current, REMOVAL_REASONS)
    cases = {
        name: continuity.distinct_semantic_cases(witnesses, CONTRACT["witnesses"])
        for name, witnesses in current.items()
    }

    sys.stdout.write(report.render(
        clause_reports, continuity_report, cases,
        CONTRACT["version"], CONTRACT["previous_version"]["version"],
        policy.removal_is_fatal(),
    ))

    unexplained = [lost["witness"] for entry in continuity_report
                   for lost in entry["lost"] if not lost["reason"]]
    unfalsifiable = [r["clause"] for r in clause_reports if not r["falsifiable"]]

    # Metron, 2026-08-09: the README said "every listed witness must really
    # falsify the clause it is listed under" and this gate only read
    # report["falsifiable"] — one working witness covered for a broken one. The
    # report printed PROVES NOTHING and the verdict did not care.
    invalid = [(r["clause"], w["witness"]) for r in clause_reports
               for w in r["witnesses"] if not w["falsifies"]]
    if invalid:
        listed = ", ".join(f"{c}/{w}" for c, w in invalid)
        sys.stdout.write(f"\n  witnesses that prove nothing: {listed}\n")

    if "--strict" not in argv:
        return 0
    if unexplained and policy.removal_is_fatal():
        return 1
    if unfalsifiable and policy.every_clause_must_be_falsifiable():
        return 1
    if invalid and policy.every_named_witness_must_be_valid():
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
