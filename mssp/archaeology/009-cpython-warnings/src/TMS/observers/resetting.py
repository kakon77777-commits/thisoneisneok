"""Clears the memory first, so every send is delivered. Imports nothing.

This is what `catch_warnings` does, though not on purpose: it mutates the filter
list, which bumps the version every registry is compared against, so every
registry is discarded. The reset is a side effect of the isolation.

It sees more, and what it sees is a frequency no caller experiences.
"""

NAME = "resetting"
PERTURBS = True


def observe(channel, run, clear, times=1):
    """Clear before EACH observation, which is what one catch_warnings block per
    call actually does — the isolation is per block, so the memory is discarded
    once per observation rather than once per session."""
    before = len(channel.delivered)
    for _ in range(times):
        if not clear():
            return {"delivered": [], "refused": "policy did not permit clearing the memory"}
        run()
    return {"delivered": channel.delivered[before:], "attempted_since": None}
