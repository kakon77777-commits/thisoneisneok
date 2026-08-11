"""Unpickle once, then hand the same object back forever.

Upstream this is `writeback=True`. Two things follow that the flag's name does
not say: a mutation through what you were handed is visible to later readers
and is written out at sync; and a pure READ retains the object, so the cache
grows with what you have looked at rather than with what you have changed.
"""
NAME = "cached-reference"
HANDS_BACK = "the same object every read, retained in this process"
MUTATION_SURVIVES = True


def make(deserialise):
    cache = {}

    def answer(key, serialised):
        if key not in cache:
            cache[key] = deserialise(serialised)
        return cache[key]

    def remember(key, value):
        cache[key] = value

    def held():
        return len(cache)

    def items():
        return list(cache.items())

    return {"answer": answer, "remember": remember, "held": held, "items": items}
