"""A page that returns everything behind it.

It imports nothing and knows nothing about the other sources. Note what it
does NOT do: it does not declare itself complete. No unit in this example is
allowed to, and refusing that is the point of section 4.
"""
NAME = "full-page"
CAN_FAIL_WITH = ["unreadable-page"]


def collect():
    return {
        "records": [{"from": NAME, "id": f"f-{n}"} for n in range(1, 4)],
        "incomplete_because": None,
    }
