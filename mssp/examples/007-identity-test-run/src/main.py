"""Reconcile two ledgers and report.

    python src/main.py                # the reconciliation
    python src/main.py --csv          # the same, as CSV
    python src/main.py --identity     # run the identity test over the SMS roster
"""
import json
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))

from SCL import policy  # noqa: E402
from SMS import format_money, normalise, parse, reconcile, sort_entries, summarise  # noqa: E402

LEFT = """
# id, description, amount
INV-3, storage,         42.50
INV-1, hosting,        120.00
INV-5, support,        300.00
INV-2, domain,          15.00
INV-4, cdn,             (8.00)
"""

RIGHT = """
INV-2, domain,          15.01
INV-6, consulting,     250.00
INV-1, hosting,        120.00
INV-3, storage,         44.00
INV-4, cdn,             (8.00)
"""


def rows_for(result):
    rows = []
    for left, right in result["differing"]:
        rows.append({
            "id": left["id"],
            "left": format_money.money(left["cents"]),
            "right": format_money.money(right["cents"]),
            "note": "amounts differ",
        })
    for entry in result["only_left"]:
        rows.append({"id": entry["id"], "left": format_money.money(entry["cents"]),
                     "right": "-", "note": "left only"})
    for entry in result["only_right"]:
        rows.append({"id": entry["id"], "left": "-",
                     "right": format_money.money(entry["cents"]), "note": "right only"})
    return rows


def build_output(argv):
    left = sort_entries.by_id(normalise.normalise(parse.parse(LEFT)))
    right = sort_entries.by_id(normalise.normalise(parse.parse(RIGHT)))
    result = reconcile.reconcile(left, right, policy.tolerance_cents())
    summary = summarise.summarise(result)

    wanted = "reports/csv" if "--csv" in argv else "reports/text"
    if not policy.permits(wanted):
        raise SystemExit(f"SCL refuses {wanted}; permitted: {policy.permitted_reports()}")

    module = __import__(f"TMS.reports.{wanted.split('/')[1]}", fromlist=["render"])
    return module.render(summary, rows_for(result))


def main(argv):
    if "--identity" in argv:
        from DMS import identity

        here = pathlib.Path(__file__).parent
        manifest = json.loads((here / "FMS" / "manifest.json").read_text(encoding="utf-8"))
        results = identity.run(here, manifest, build_output([]))
        sys.stdout.write(identity.render(results, manifest))
        return 0

    sys.stdout.write(build_output(argv))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
