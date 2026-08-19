"""d.get(key, SENTINEL) - the value together with whether it was there.

This is the repair example 019 argues for, already in the language: an answer
that carries its own applicability. It is not the default and it costs one
object() the caller has to create.
"""
READER = "d.get(key, SENTINEL)"
SEPARATES_MISSING_FROM_NONE = True
RAISES_ON_MISSING = False

MISSING = object()


def read(mapping, key):
    found = mapping.get(key, MISSING)
    if found is MISSING:
        return {"value": None, "raised": None, "present": False}
    return {"value": found, "raised": None, "present": True}
