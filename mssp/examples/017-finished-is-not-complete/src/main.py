"""Four sources, all of them finish, and they are not all complete.

    python src/main.py            the run under the deployment SCL names
    python src/main.py --axes     finished and complete, side by side
    python src/main.py --strict   exit 1 when a source declared itself incomplete and that is fatal
"""
import sys

from DMS import report
from SCL import policy
from SMS import gather


def main(argv):
    loaded, problems = gather.load()
    if problems:
        for problem in problems:
            print(f"  REFUSED: {problem}")
        return 1

    runs = gather.run_all(loaded)
    total = sum(len(row["records"]) for row in runs)
    at_least = gather.at_least_incomplete(runs)

    print(f"\n  {policy.describe()}\n")
    print(report.rows(runs))
    print()
    print(report.floor(at_least, total))

    if "--axes" in argv:
        print()
        print(report.two_axes(runs))
        print()
        print("  removed (island test), for contrast:")
        removed = gather.run_all(loaded, absent=["truncated-page"])
        print(report.rows(removed))
        print(f'\n  at least {gather.at_least_incomplete(removed)} of '
              f'{sum(len(row["records"]) for row in removed)} - removing the one source that '
              f'declared\n  anything takes the warning away and leaves the other truncation behind.')

    declared = [row for row in runs if row["completeness"] == gather.DECLARED_INCOMPLETE]
    if "--strict" in argv and declared and policy.is_fatal():
        print(f"\n  --strict: {len(declared)} source(s) declared themselves incomplete and this "
              f"deployment calls that fatal")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
