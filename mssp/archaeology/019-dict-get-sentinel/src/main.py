"""One key, three readers, and two situations that are one value.

    python src/main.py            what each reader can tell apart
    python src/main.py --strict   exit 1 if this deployment cannot separate unset from null
"""
import json
import pathlib
import sys

from DMS import report
from SMS import upstream
from TMS.readers import forgiving, subscript, with_sentinel

HERE = pathlib.Path(__file__).parent
POLICY = json.loads((HERE / "SCL" / "policy.json").read_text(encoding="utf-8"))
READERS = {module.READER: module for module in (forgiving, with_sentinel, subscript)}


def main(argv):
    print(f"\n  {upstream.versions()}")
    print(f'  {POLICY["deployment"]}: read with {POLICY["reader"]}\n')

    rows = []
    for module in (forgiving, with_sentinel, subscript):
        rows.append({"mapping": "{'a': None}", **upstream.through(module, upstream.PRESENT_NONE)})
        rows.append({"mapping": "{}", **upstream.through(module, upstream.MISSING)})
    print(report.reads(rows))
    print("\n  Rows 1 and 2 are the finding: same value, same type, same object.")
    print("  The next four are discriminators that exist and are not what people write.\n")

    table = upstream.falsy_table()
    collapsed = upstream.collapsed(table)
    present = upstream.of_those_present(table)
    print("  and the idiomatic falsy test collapses further:")
    print(report.falsy(table, collapsed, present))
    print(f"\n  So `if not d.get(key)` is right about absence in 1 case out of {collapsed}.")

    in_force = READERS[POLICY["reader"]]
    if "--strict" in argv and not upstream.separates(in_force) \
            and POLICY["an_unset_key_read_as_null_is"] == "fatal":
        print(f'\n  --strict: {in_force.READER} cannot separate unset from null and that is fatal here')
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
