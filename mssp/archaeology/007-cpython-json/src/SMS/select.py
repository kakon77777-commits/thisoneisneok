"""Choosing an implementation, and being able to say which one you got.

Upstream binds the choice at import time:

    make_scanner = c_make_scanner or py_make_scanner    # json/scanner.py

That is one line, it is correct, and it has a consequence: after import there is
no way to select the other one, and no way to ask which was taken except by
inspecting the type of an object it produced. Setting c_make_scanner = None
later changes nothing, because the `or` already ran.

Here the choice is made per call from values that are still live, and the
selection is returned beside the result.
"""
import importlib

FAST = "impl/fast"
PLAIN = "impl/plain"


def available():
    """Which implementations this installation actually has."""
    found = []
    for name in (FAST, PLAIN):
        try:
            importlib.import_module(f"TMS.{name.replace('/', '.')}")
            found.append(name)
        except ImportError:
            pass
    return found


def choose(prefer_fast, allowed):
    """Return (name, module). Never raises for a missing accelerator."""
    order = [FAST, PLAIN] if (prefer_fast and allowed) else [PLAIN]
    for name in order:
        try:
            return name, importlib.import_module(f"TMS.{name.replace('/', '.')}")
        except ImportError:
            continue
    raise RuntimeError("no implementation is available at all")
