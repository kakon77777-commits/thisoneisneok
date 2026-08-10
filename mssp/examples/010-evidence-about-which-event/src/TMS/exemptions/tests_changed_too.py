"""The exemption that started all this: a source file may drift if its tests moved too.

The observation is real and it is not a constant — across the history it takes
several values. What it does not carry, unless someone asks for it, is which
round it took that value in. Note that `observed` reads identically whether the
test changed in this round or four rounds ago; only `about` can tell them apart.
"""
RULE = "tests-changed-too"


def look(change, ctx):
    test_path = ctx["declarations"]["test_for"].get(change["path"])
    if not test_path:
        return None

    # The most recent round, at or before the one under judgement, in which that
    # test file changed. Walking forward and stopping is deliberate: a test
    # change from a LATER round is not evidence about this one either.
    seen_in = None
    for rnd in ctx["rounds"]:
        for changed in rnd["changes"]:
            if changed["path"] == test_path:
                seen_in = rnd["id"]
        if rnd["id"] == change["round"]:
            break

    if seen_in is None:
        return None
    return {"rule": RULE, "about": seen_in, "observed": f"{test_path} changed"}
