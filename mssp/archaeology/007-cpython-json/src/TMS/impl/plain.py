"""The plain escaper: branches, no table.

Deliberately identical in output and DIFFERENT in one error message, which is
the divergence measured in CPython 3.14.5 between _json and its fallback.
Imports nothing.
"""

NAME = "impl/plain"

_NAMED = {'"': '\\"', "\\": "\\\\", "\n": "\\n", "\t": "\\t", "\r": "\\r"}


def escape(text):
    if not isinstance(text, str):
        # Upstream's fallback names the offending value; the C path does not.
        raise TypeError(f"escape expects str, got {type(text).__name__}")
    out = []
    for ch in text:
        if ch in _NAMED:
            out.append(_NAMED[ch])
        elif ord(ch) < 0x20:
            out.append(f"\\u{ord(ch):04x}")
        else:
            out.append(ch)
    return "".join(out)
