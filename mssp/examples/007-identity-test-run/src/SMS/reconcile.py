"""Match two ledgers by id. Remove it and the program has no answer."""


def reconcile(left, right, tolerance_cents):
    by_id_right = {e["id"]: e for e in right}
    matched, differing, only_left, only_right = [], [], [], []

    for entry in left:
        other = by_id_right.pop(entry["id"], None)
        if other is None:
            only_left.append(entry)
        elif abs(entry["cents"] - other["cents"]) <= tolerance_cents:
            matched.append((entry, other))
        else:
            differing.append((entry, other))

    only_right = list(by_id_right.values())

    total = len(matched) + len(differing) + len(only_left) + len(only_right)
    if total != len(left) + len(only_right):
        raise AssertionError(
            f"reconciliation lost entries: {total} accounted for, {len(left) + len(only_right)} seen"
        )
    return {"matched": matched, "differing": differing, "only_left": only_left, "only_right": only_right}
