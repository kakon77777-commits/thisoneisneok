"""git's fields about who made a commit, measured against a throwaway repository.

    python src/main.py            the log, the fields, and which one separates
    python src/main.py --strict   exit 1 if the trusted field is a claim
"""
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE))

from DMS import report  # noqa: E402
from SCL import policy  # noqa: E402
from SMS import fields, upstream  # noqa: E402

ARCH = json.loads((HERE / "FMS" / "architecture.json").read_text(encoding="utf-8"))


def main(argv):
    out = lambda line="": sys.stdout.write(line + "\n")  # noqa: E731
    loaded, problems = fields.load()
    if problems:
        for problem in problems:
            out(f"  !! {problem}")
        return 1

    directory = upstream.build_repository()
    rows = upstream.commits(directory)

    out(f"\n== three commits, one of which was not made by who it says  [git {upstream.version()}]")
    report.log(rows, out)
    report.fields(loaded, rows, fields.separates, out)

    out("\n== the raw object of the impersonating commit")
    for line in upstream.raw_object(directory).splitlines()[:5]:
        out(f"    {line}")
    out(f"    contains a signature block: {'gpgsig' in upstream.raw_object(directory)}")

    out("\n== the trailer, and what reads it")
    out(f"    stored:  {upstream.trailer(directory)}")
    out("    read by: nothing in git. It is a line of the message.")
    out(f"    note:    {ARCH['self_implication'] if 'self_implication' in ARCH else ARCH['the_self_implication']}")

    trusted, problem = fields.resolve(policy.trusted(), loaded)
    if problem:
        out(f"\n  !! {problem}")
        return 1
    out(f"\n== this deployment would trust `{trusted.NAME}` for identity, which records {"an act" if trusted.KIND == "act" else "a claim"}")

    report.gaps(out)

    if "--strict" in argv and trusted.KIND == "claim" and policy.claim_as_identity_is_fatal():
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
