"""Check the declared alias against what the two emitters actually do.

    python src/main.py
"""
import json
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))

from DMS import report  # noqa: E402
from SCL import policy  # noqa: E402
from SMS import contract, observe  # noqa: E402
from TMS.emitters import current, legacy  # noqa: E402

HERE = pathlib.Path(__file__).parent
RECORD = json.loads((HERE / "FMS" / "architecture.json").read_text(encoding="utf-8"))


def main():
    alias = RECORD["compatibility_aliases"][0]
    observer = RECORD["observers"][alias["equivalence"]["observer"]]

    before = observe.observe(lambda buf: legacy.emit(buf, "disk almost full", current.emit))
    after = observe.observe(lambda buf: current.emit(buf, "disk almost full"))

    result = contract.check(alias, observer, before, after,
                            policy.accepts_channel_deltas(), policy.never_differ())
    note = (f"SCL: channel deltas {'accepted' if policy.accepts_channel_deltas() else 'REFUSED'}; "
            f"never-differ channels: {', '.join(policy.never_differ())}")
    sys.stdout.write(report.render(alias, observer, result, note))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
