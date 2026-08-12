"""Two handles, taking turns. Written down, not raced for.

A schedule is a unit here because it is the thing that decides which failures
are visible at all. This one declares what it is capable of revealing; the
island test checks that declaration by running it.
"""
NAME = "interleaved"
REVEALS = ["lost-update", "torn-index"]


def order(writers, steps_each):
    return [who for _ in range(steps_each) for who in range(writers)]
