"""The same holdings, and it never declares anything.

Its incentive is a genuine, measured zero: the counterfactual runs, both arms
complete, and they agree.
"""
NAME = "never-declares"
CAN_FAIL_WITH = ["unreadable-page", "cursor-expired"]
HELD = 6
DECLARATION_IS_SUPPRESSIBLE = True


def collect(budget=1):
    take = min(HELD, budget * 3)
    return {
        "records": [{"from": NAME, "id": f"n-{n}"} for n in range(1, take + 1)],
        "incomplete_because": None,
    }
