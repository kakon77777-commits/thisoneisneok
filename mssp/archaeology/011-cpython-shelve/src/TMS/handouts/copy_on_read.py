"""Unpickle on every read. What the caller gets is theirs.

Upstream this is `writeback=False`, the default, and it is three lines of
`Shelf.__getitem__` that never touch the cache.
"""
NAME = "copy-on-read"
HANDS_BACK = "a fresh object on every read"
MUTATION_SURVIVES = False


def make(deserialise):
    def answer(key, serialised):
        return deserialise(serialised)

    def remember(key, value):
        return None

    def held():
        return 0

    def items():
        # Nothing is retained, so a sync has nothing to write back. That is the
        # whole reason a mutation through a handed-out object goes nowhere.
        return []

    return {"answer": answer, "remember": remember, "held": held, "items": items}
