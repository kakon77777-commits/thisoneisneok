"""The old name: delegates and announces itself.

This is CPython's shape, not eslint's. It does not spread an object and it does
not reimplement — it calls through, after raising a warning. Imports nothing:
the delegation target is passed in, so this unit names no sibling.
"""
import warnings

NAME = "warn"


def emit(buffer, message, delegate):
    warnings.warn("The 'warn' name is deprecated, use 'warning' instead",
                  DeprecationWarning, stacklevel=2)
    return delegate(buffer, message)
