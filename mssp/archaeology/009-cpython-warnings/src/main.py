"""Send the same notice five times, watched two ways.

    python src/main.py
"""
import json
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))

from DMS import report  # noqa: E402
from SCL import policy  # noqa: E402
from SMS.channel import Channel  # noqa: E402
from TMS.observers import passive, resetting  # noqa: E402

HERE = pathlib.Path(__file__).parent
RECORD = json.loads((HERE / "FMS" / "architecture.json").read_text(encoding="utf-8"))


def main():
    channel = Channel()

    def one_call():
        channel.send("ledger.py:41", "the 'warn' name is deprecated, use 'warning'")

    def five_calls():
        for _ in range(5):
            one_call()

    results = {}
    if policy.permits(passive.NAME):
        results[passive.NAME] = passive.observe(channel, five_calls)
    if policy.permits(resetting.NAME):
        # Five observations, each isolated — the shape of a test that wraps
        # every call in its own catch_warnings block.
        results[resetting.NAME] = resetting.observe(
            channel, one_call,
            lambda: channel.clear_memory("test-harness", policy.may_clear),
            times=5,
        )

    note = (f"SCL: default observer is {policy.default_observer()}; "
            f"may clear the memory: {'test-harness' if policy.may_clear('test-harness') else 'nobody'}")
    sys.stdout.write(report.render(RECORD, results, channel, note))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
