"""A page that finishes cleanly and knows it did not return everything.

Nothing goes wrong here. No exception, no empty result, no early return. The
call completes and the unit holds one fact the collector cannot observe from
outside: there is a cursor it was not allowed to follow.

`incomplete_because` is a declaration, and it is the only kind this example
takes on trust — it can only make the report worse for the unit that made it.
"""
NAME = "truncated-page"
CAN_FAIL_WITH = ["unreadable-page", "cursor-expired"]


def collect():
    return {
        "records": [{"from": NAME, "id": f"t-{n}"} for n in range(1, 3)],
        "incomplete_because": "more-after-cursor",
    }
