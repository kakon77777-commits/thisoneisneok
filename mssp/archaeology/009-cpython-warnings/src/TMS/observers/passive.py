"""Watches without touching. Imports nothing.

Sees what a caller in the same process sees — which means a notice already
delivered before this observer started is invisible to it, and it will report
zero for a channel that is working exactly as designed.
"""

NAME = "passive"
PERTURBS = False


def observe(channel, run):
    before = len(channel.delivered)
    run()
    return {"delivered": channel.delivered[before:], "attempted_since": None}
