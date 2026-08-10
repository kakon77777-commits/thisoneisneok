"""A review gate that asks what its evidence is evidence OF.

    python src/main.py             the review under the guard SCL names
    python src/main.py --strict    exit 1 when a fatal code appears
    python src/main.py --compare   both guards over the same history, side by side
"""
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE))

from DMS import report  # noqa: E402
from SCL import policy  # noqa: E402
from SMS import review  # noqa: E402

CONTRACT = json.loads((HERE / "FMS" / "contract.json").read_text(encoding="utf-8"))


def main(argv):
    out = lambda line="": sys.stdout.write(line + "\n")  # noqa: E731
    strict = "--strict" in argv

    if "--compare" in argv:
        out("\n== the same history, judged by each guard")
        out(f"\n  {'change':<34} {'event-blind-v1':<16} event-scoped-v1")
        results = {}
        for name in CONTRACT["guards"]:
            rows, problems = review.review(CONTRACT, name)
            if problems:
                for problem in problems:
                    out(f"  !! {problem}")
                return 1
            results[name] = rows
        blind, scoped = results["event-blind-v1"], results["event-scoped-v1"]
        for left, right in zip(blind, scoped):
            label = f"{left['round']} {left['path']}"
            flag = "  <-- differs" if left["verdict"] != right["verdict"] else ""
            out(f"  {label:<34} {left['verdict']:<16} {right['verdict']}{flag}")
        for name, rows in results.items():
            values = review.verdict_values(rows)
            out(f"\n  {name:<16} produced {len(values)} distinct verdict(s): {', '.join(values)}")
        out("\n  A guard that produced one verdict over this history could not have")
        out("  come out any other way here. That is a fact about this history as")
        out("  much as about the guard - see island_test.py section 3.")
        return 0

    guard_name = policy.guard()
    rows, problems = review.review(CONTRACT, guard_name)
    if problems:
        for problem in problems:
            out(f"  !! {problem}")
        return 1

    out(f"\n== review under {guard_name}")
    report.rows(rows, out)

    out("\n== why each change was let through, or was not")
    report.verdict_counts(rows, out)

    fatal = [row for row in rows if policy.is_fatal(row["code"])]
    if fatal:
        out(f"\n  {len(fatal)} change(s) the deployment treats as fatal:")
        for row in fatal:
            out(f"    {row['round']} {row['path']:<24} {row['code']:<20} {row['because']}")

    report.blind_spots(out)

    if strict and fatal:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
