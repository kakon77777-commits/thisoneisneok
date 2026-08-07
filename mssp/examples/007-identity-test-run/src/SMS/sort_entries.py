"""Stable ordering for display.

Also claims to be SMS. Also added because it was used in more than one place,
which is a reason to share code and not a reason to call it structural.
"""


def by_id(entries):
    return sorted(entries, key=lambda e: e["id"])
