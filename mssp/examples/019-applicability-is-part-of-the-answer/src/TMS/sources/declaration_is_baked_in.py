"""It declares, and the declaration cannot be taken away.

The incompleteness is not a field beside the records — it is a record. A
harness that wants to ask "what would this unit have contributed WITHOUT its
declaration" has nothing to remove: removing the marker removes a row, which
changes the very quantity being compared.

This is the unit example 018 could not measure and reported as 0 anyway.
"""
NAME = "baked-in"
CAN_FAIL_WITH = ["unreadable-page", "cursor-expired"]
HELD = 6
DECLARATION_IS_SUPPRESSIBLE = False


def collect(budget=1):
    take = min(HELD, budget * 3)
    records = [{"from": NAME, "id": f"b-{n}"} for n in range(1, take + 1)]
    if take < HELD:
        records.append({"from": NAME, "id": "b-cursor", "marker": "more-after-cursor"})
    return {
        "records": records,
        "incomplete_because": "more-after-cursor" if take < HELD else None,
    }
