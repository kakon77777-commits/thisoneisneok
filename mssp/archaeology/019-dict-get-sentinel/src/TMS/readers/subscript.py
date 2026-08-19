"""d[key] - the strict one, which refuses instead of guessing.

Same shape as zlib's one-shot in archaeology 017: within one type, the
forgiving accessor returns a value in silence and the strict one raises.
"""
READER = "d[key]"
SEPARATES_MISSING_FROM_NONE = True
RAISES_ON_MISSING = True


def read(mapping, key):
    try:
        return {"value": mapping[key], "raised": None, "present": True}
    except KeyError as raised:
        return {"value": None, "raised": f"KeyError({raised})", "present": False}
