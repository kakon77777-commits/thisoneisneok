"""The control.

Two records, finishes cleanly, and genuinely has nothing more behind it.
`truncated_page` also returns two records and also finishes cleanly. Without
this file, "two records and finished" and "two records, finished, and there is
more" would be one observation, and section 3 could not come out badly.

Same role as `short-batch` in example 016 and `archive-dump` in example 015.
"""
NAME = "short-page"
CAN_FAIL_WITH = ["unreadable-page"]


def collect():
    return {
        "records": [{"from": NAME, "id": f"s-{n}"} for n in range(1, 3)],
        "incomplete_because": None,
    }
