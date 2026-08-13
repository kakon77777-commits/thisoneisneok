"""Four rules, two worlds identical in every artifact.

    python src/main.py            every rule over both worlds
    python src/main.py --strict   exit 1 if the configured rule cannot separate them
"""
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE))

from DMS import report  # noqa: E402
from SCL import policy  # noqa: E402
from SMS import approval  # noqa: E402

ARCH = json.loads((HERE / "FMS" / "contract.json").read_text(encoding="utf-8"))


def main(argv):
    out = lambda line="": sys.stdout.write(line + "\n")  # noqa: E731
    loaded, problems = approval.load_rules()
    if problems:
        for problem in problems:
            out(f"  !! {problem}")
        return 1

    out("\n== two worlds, and every artifact in them is identical")
    for name, description in ARCH["the_two_worlds"].items():
        out(f"    {name:<15} {description}")

    rows = approval.run(loaded)
    report.table(rows, out)
    report.blindness(rows, out)

    configured, problem = approval.resolve(policy.rule(), loaded)
    if problem:
        out(f"\n  !! {problem}")
        return 1
    row = next(r for r in rows if r["rule"] == policy.rule())
    separates = len(set(row["verdicts"].values())) > 1
    out(f"\n== this deployment trusts {policy.rule()}")
    out(f"    it {'separates' if separates else 'CANNOT separate'} the two worlds")

    report.gaps(out)

    if "--strict" in argv and not separates and policy.indistinguishable_is_fatal():
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
