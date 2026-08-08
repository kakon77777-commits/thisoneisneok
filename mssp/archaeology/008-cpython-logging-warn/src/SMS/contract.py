"""Checking a declared equivalence whose permitted differences are channels."""


def check(alias, observer, before, after, accepts_channel_deltas, never_differ):
    permitted = {d["channel"]: d["permit"] for d in alias["equivalence"]["allowed_deltas"]}
    channels = list(observer["channels"])
    clauses = []

    for channel in channels:
        same = before[channel] == after[channel]
        if same:
            clauses.append((channel, True, "identical", None))
            continue
        if channel in never_differ:
            clauses.append((channel, False, f"differs, and policy forbids any delta on {channel}", None))
            continue
        if channel not in permitted:
            clauses.append((channel, False, "differs and is not in allowed_deltas", (before[channel], after[channel])))
            continue
        if not accepts_channel_deltas:
            clauses.append((channel, False, "declared as permitted, but this deployment refuses channel deltas",
                            (before[channel], after[channel])))
            continue
        clauses.append((channel, True, f"differs, declared: {permitted[channel]}",
                        (before[channel], after[channel])))

    # A channel named in allowed_deltas that never actually differed is worth
    # reporting: the permission was never exercised, so this run says nothing
    # about whether it was needed.
    unexercised = [c for c in permitted if before.get(c) == after.get(c)]
    return {"clauses": clauses, "unexercised_permissions": unexercised,
            "holds": all(ok for _, ok, _, _ in clauses)}
