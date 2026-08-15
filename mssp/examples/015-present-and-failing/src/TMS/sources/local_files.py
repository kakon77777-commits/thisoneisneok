"""A source that works.

Every unit here declares what it can fail WITH, not merely that it might. The
island test removes units; nothing in the method until now asked a unit what a
bad day looks like.
"""
NAME = "local-files"
CAN_FAIL_WITH = ["unreadable-path"]


def collect():
    return {"records": [{"id": "L-1"}, {"id": "L-2"}], "failed": None}
