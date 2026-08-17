"""A page that is truncated and says nothing. Deliberately in the example.

This is the limit, kept as a running unit rather than as a sentence in the
README. It is truncated in exactly the way `truncated_page` is, and it declares
nothing — so the collector reports it identically to `short_page`, which is
complete.

Section 6 of the island test ASSERTS that indistinguishability. If that check
ever goes red, the limit changed and the documents are wrong.
"""
NAME = "quiet-truncation"
CAN_FAIL_WITH = ["unreadable-page", "cursor-expired"]

# Kept as data so the test can state what is true of this unit and unobservable
# from outside it. Nothing in SMS reads it.
TRUTH_THE_COLLECTOR_CANNOT_SEE = "there is a cursor after these two records"


def collect():
    return {
        "records": [{"from": NAME, "id": f"q-{n}"} for n in range(1, 3)],
        "incomplete_because": None,
    }
