"""d.get(key) - the one everybody writes.

It declares that it does NOT separate a missing key from a key whose value is
None. The declaration is checked by running it, not by reading this line.
"""
READER = "d.get(key)"
SEPARATES_MISSING_FROM_NONE = False
RAISES_ON_MISSING = False


def read(mapping, key):
    return {"value": mapping.get(key), "raised": None}
