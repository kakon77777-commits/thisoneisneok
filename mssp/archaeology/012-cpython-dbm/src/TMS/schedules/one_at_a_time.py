"""One writer finishes before the next starts.

This is what a test suite with a single writer produces, and it reveals nothing
about concurrency - which is the finding rather than a shortcoming of the file.
An empty REVEALS is a claim, and the island test makes it fail if it is wrong.
"""
NAME = "one-at-a-time"
REVEALS = []


def order(writers, steps_each):
    return [who for who in range(writers) for _ in range(steps_each)]
