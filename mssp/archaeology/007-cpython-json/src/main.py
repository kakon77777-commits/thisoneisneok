"""Compare the two implementations against the written contract.

    python src/main.py
"""
import json
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))

from DMS import equivalence  # noqa: E402
from SCL import policy  # noqa: E402
from SMS import drive, select  # noqa: E402

CORPUS = [
    "plain",
    'quote " and backslash \\',
    "tab\there",
    "newline\nhere",
    "control\x00\x1f",
    "unicode héllo 中文",
    "",
    42,          # not a str: both must raise
    None,        # not a str: both must raise
]


def main():
    manifest = json.loads(
        (pathlib.Path(__file__).parent / "FMS" / "manifest.json").read_text(encoding="utf-8"))
    contract = manifest["equivalence_contract"]

    print(f"\n  available implementations : {', '.join(select.available())}")
    print(f"  SCL allows the accelerator: {policy.accelerator_allowed()}")

    fast_name, fast = select.choose(prefer_fast=True, allowed=policy.accelerator_allowed())
    plain_name, plain = select.choose(prefer_fast=False, allowed=policy.accelerator_allowed())
    print(f"  chosen with preference    : {fast_name}")
    print(f"  chosen without            : {plain_name}")

    if fast_name == plain_name:
        print("\n  REFUSING to report an equivalence: both sides are the same implementation.")
        print("  This is the check my first measurement of CPython did not have, and it")
        print("  reported the C scanner identical to itself.")
        return 1

    findings = equivalence.compare(
        contract, CORPUS,
        fast_name, drive.run(fast, CORPUS),
        plain_name, drive.run(plain, CORPUS),
    )
    clauses = equivalence.verdict(contract, findings, policy.error_text_must_match())
    sys.stdout.write(equivalence.render(fast_name, plain_name, findings, clauses))
    return 0 if all(ok for _, ok, _ in clauses) else 2


if __name__ == "__main__":
    raise SystemExit(main())
