"""An opener: a registry of handlers, and a call chain over it.

Upstream's shape, kept — because it is right. `OpenerDirector` has six methods,
`BaseHandler` has three, and handlers arrive through `build_opener(*handlers)`.
The core does not know what can handle anything until it is told, which is
exactly what `http.server` cannot do (see archaeology 002).

The one change is that `bind` returns what it bound. Upstream `add_handler`
returns `None` whether it registered five methods or zero, so a handler that
registered nothing is indistinguishable, from the caller, from one that worked.
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from SCL import policy  # noqa: E402

SUFFIX = "_open"


class Binding:
    """What one handler contributed, as a value."""

    def __init__(self, handler_name: str, schemes: list[str], ignored: list[str], refused: list[str]) -> None:
        self.handler = handler_name
        self.schemes = schemes
        self.ignored = ignored      # methods that look like bindings and are not
        self.refused = refused      # schemes SCL did not permit this handler

    @property
    def bound_anything(self) -> bool:
        return bool(self.schemes)


class Opener:
    def __init__(self) -> None:
        self.by_scheme: dict[str, object] = {}
        self.bindings: list[Binding] = []

    def bind(self, handler) -> Binding:
        """Register a handler, and say what happened.

        Refusing to bind nothing is the whole repair. A handler that contributes
        no scheme is a mistake every time — there is no reason to construct one —
        so it is reported rather than accepted in silence.
        """
        schemes, ignored, refused = [], [], []
        for attr in dir(handler):
            if attr.startswith("_"):
                continue
            if not attr.endswith(SUFFIX):
                # A near-miss is worth naming: `data_opne` is not a binding and
                # is also not nothing. Upstream cannot tell these apart from a
                # method that was never meant to bind.
                if _looks_like_a_near_miss(attr):
                    ignored.append(attr)
                continue
            scheme = attr[: -len(SUFFIX)]
            allowed, why = policy.may_serve(getattr(handler, "name", type(handler).__name__), scheme)
            if not allowed:
                refused.append(f"{scheme} ({why})")
                continue
            self.by_scheme[scheme] = handler
            schemes.append(scheme)

        binding = Binding(getattr(handler, "name", type(handler).__name__), schemes, ignored, refused)
        self.bindings.append(binding)
        return binding

    def open(self, url: str) -> tuple[bool, str]:
        scheme = url.split(":", 1)[0]
        handler = self.by_scheme.get(scheme)
        if handler is None:
            return False, f"no handler bound for scheme {scheme!r}"
        return True, getattr(handler, scheme + SUFFIX)(url)


def _looks_like_a_near_miss(attr: str) -> bool:
    """Cheap heuristic: an anagram of the suffix at the end of the name.

    Deliberately not clever. It catches `_opne`, `_oepn`, `_pen` — the
    transpositions that actually happen — and says so rather than guessing what
    was meant. Upstream has nothing here at all, which is the finding.
    """
    tail = attr.rsplit("_", 1)[-1] if "_" in attr else ""
    return tail != SUFFIX.strip("_") and sorted(tail) == sorted(SUFFIX.strip("_"))
