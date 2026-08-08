"""The observer: run a callable and collect every channel it is defined over.

The amendment this entry produced. mssp-d-001's draft record wrote
allowed_deltas as dotted field paths, which can describe `meta.deprecated` on an
object and cannot describe "the old name raises a DeprecationWarning". A field
path assumes the thing being compared IS an object with fields. Here the two
callables are indistinguishable as objects and differ only in what they emit.
"""
import io
import warnings


def observe(call):
    """Return {channel: observation} for one call."""
    buffer = io.StringIO()
    with warnings.catch_warnings(record=True) as caught:
        warnings.simplefilter("always")
        try:
            returned = call(buffer)
            raised = None
        except Exception as exc:  # noqa: BLE001 - the class is part of the observation
            returned, raised = None, type(exc).__name__
    return {
        "output": buffer.getvalue(),
        "warnings": [(w.category.__name__, str(w.message)) for w in caught],
        "return": repr(returned) if raised is None else f"raised {raised}",
    }
