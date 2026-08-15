"""A source that legitimately has nothing today.

The control. Without a unit that returns zero records and has NOT failed, an
empty result and a failure are the same observation, and the report cannot be
shown to distinguish them.
"""
NAME = "archive-dump"
CAN_FAIL_WITH = ["corrupt-archive"]


def collect():
    return {"records": [], "failed": None}
