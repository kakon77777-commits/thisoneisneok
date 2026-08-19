"""Holds six records, hands over three per unit of budget, and says so.

Its declaration is a separate field on the result, so a harness can withhold it
without changing anything else. That is what makes this unit measurable.
"""
NAME = "declares-openly"
CAN_FAIL_WITH = ["unreadable-page", "cursor-expired"]
HELD = 6
DECLARATION_IS_SUPPRESSIBLE = True


def collect(budget=1):
    take = min(HELD, budget * 3)
    return {
        "records": [{"from": NAME, "id": f"d-{n}"} for n in range(1, take + 1)],
        "incomplete_because": "more-after-cursor" if take < HELD else None,
    }
