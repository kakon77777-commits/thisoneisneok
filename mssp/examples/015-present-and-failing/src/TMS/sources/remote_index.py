"""A source that is present and failing.

Not absent — loaded, resolved, called, and returning nothing because the thing
it depends on is unavailable. This is the state the island test cannot produce:
removing this unit and breaking it give the same record count.
"""
NAME = "remote-index"
CAN_FAIL_WITH = ["unreachable", "timeout"]


def collect():
    return {"records": [], "failed": "unreachable"}
