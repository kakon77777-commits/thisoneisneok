"""Three sources, four outcomes, and one number that cannot tell them apart.

    python src/main.py            the run under the policy SCL names
    python src/main.py --strict   exit 1 when a source failed and the policy is fatal
    python src/main.py --compare  the same task with remote-index absent, and broken
"""
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE))

from DMS import report  # noqa: E402
from SCL import policy  # noqa: E402
from SMS import gather  # noqa: E402

CONTRACT = json.loads((HERE / "FMS" / "contract.json").read_text(encoding="utf-8"))


def main(argv):
    out = lambda line="": sys.stdout.write(line + "\n")  # noqa: E731
    loaded, problems = gather.load()
    if problems:
        for problem in problems:
            out(f"  !! {problem}")
        return 1

    if "--compare" in argv:
        out("\n== the same task, twice: remote-index removed, and remote-index broken")
        removed = gather.gather(loaded, absent={"remote-index"})
        broken = gather.gather(loaded)
        out(f"\n  {'':<24} {'records':<9} outcome for remote-index")
        for label, rows in (("removed (island test)", removed), ("present and failing", broken)):
            row = next(r for r in rows if r["source"] == "remote-index")
            out(f"  {label:<24} {gather.total(rows):<9} {row['outcome']}")
        out("\n  Same total. The island test can produce the first row and not the second,")
        out("  so a method whose only structural drill is removal has never seen the")
        out("  state a running system spends its bad days in.")
        return 0

    rows = gather.gather(loaded)
    degraded = gather.degraded(rows)
    out(f"\n== gather, policy on failure: {policy.on_failure()}")
    report.outcomes(rows, out)
    report.headline(rows, gather.total(rows), degraded, out, policy.must_say_so())
    report.collapse(rows, out)
    report.gaps(out)

    if "--strict" in argv and degraded and policy.on_failure() == "fatal":
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
