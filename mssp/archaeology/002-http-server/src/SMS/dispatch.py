"""Choosing a handler for a request.

Upstream this is one line inside `handle_one_request`:

    method = getattr(self, mname)

which is why adding a verb means subclassing. The set of handlers is the set of
attributes on the instance, so there is no way to hand the dispatcher a
different set — and no way to have one without having all of them.

Here handlers are values in a registry. The dispatcher is told what exists,
which is what lets a caller pass exactly one.
"""
from __future__ import annotations

import sys
from pathlib import Path
from typing import Callable, Protocol

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from SCL import policy                          # noqa: E402
from SMS.message import Request, Response       # noqa: E402


class Handler(Protocol):
    name: str
    method: str

    def matches(self, request: Request) -> bool: ...

    def handle(self, request: Request) -> Response: ...


def dispatch(
    request: Request,
    handlers: list[Handler],
    *,
    on_event: Callable[..., None] = lambda **_: None,
) -> Response:
    # Method *and* target, which is the difference that matters. Upstream
    # dispatches on the verb alone, because the verb is the attribute name:
    # `getattr(self, 'do_GET')` can only ever find one thing. Two capabilities
    # that both answer GET — a health probe and a file server — cannot both
    # exist as handlers there; one of them has to become a branch inside the
    # other's method, or arrive by inheritance order.
    #
    # The first version of this file matched on method alone and reproduced the
    # same limitation by accident: the health handler answered every GET and the
    # file handler never ran once, including for the request written to test
    # that it refuses to leave its root.
    handler = next((h for h in handlers if h.method == request.method and h.matches(request)), None)

    if handler is None:
        on_event(kind="unhandled", method=request.method, target=request.target)
        allowed = ", ".join(sorted({h.method for h in handlers})) or "none"
        return Response(405, "Method Not Allowed", headers={"Allow": allowed})

    if not policy.may_handle(handler.name, request.method):
        on_event(kind="refused", handler=handler.name, method=request.method)
        return Response(403, "Forbidden", b"handler is not permitted this method")

    response = handler.handle(request)
    on_event(kind="handled", handler=handler.name, status=response.status,
             method=request.method, target=request.target)
    return response
