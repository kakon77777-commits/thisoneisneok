"""Cents to a display string.

Claims to be SMS because "every report needs it". The identity test disagrees,
and the run is what says so — not this docstring.
"""


def money(cents):
    sign = "-" if cents < 0 else ""
    value = abs(cents)
    return f"{sign}${value // 100}.{value % 100:02d}"
