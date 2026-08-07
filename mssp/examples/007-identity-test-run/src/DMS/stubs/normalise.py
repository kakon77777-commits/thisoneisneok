"""Stub: every amount is zero cents. Entries keep their ids."""


def normalise(entries):
    return [{**e, "cents": 0} for e in entries]
