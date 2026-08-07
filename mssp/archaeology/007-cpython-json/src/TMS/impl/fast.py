"""The "accelerated" escaper: a table lookup built once.

Stands in for _json. Imports nothing.
"""

NAME = "impl/fast"

_TABLE = {c: f"\\u{ord(c):04x}" for c in map(chr, range(0x20))}
_TABLE.update({'"': '\\"', "\\": "\\\\", "\n": "\\n", "\t": "\\t", "\r": "\\r"})


def escape(text):
    if not isinstance(text, str):
        raise TypeError("escape expects str")
    return "".join(_TABLE.get(ch, ch) for ch in text)
