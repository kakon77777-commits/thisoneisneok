"""What each handler may do.

`may_handle` is called by SMS/dispatch before a handler runs, so a handler
cannot answer a method its policy entry does not list — regardless of what it
would have done.

`confine` is the one worth comparing with upstream. `SimpleHTTPRequestHandler`
keeps requests inside the served directory in `translate_path`, a method the
subclass may override; the confinement holds because subclasses do not override
it. Here it is a function the handler must call and cannot replace.
"""
from __future__ import annotations

import json
from pathlib import Path

_POLICY = json.loads(Path(__file__).with_name("policy.json").read_text(encoding="utf-8"))
HANDLERS: dict[str, dict] = _POLICY["handlers"]


class Refused(Exception):
    """Raised when a handler asks for something its entry does not grant."""


def may_handle(handler: str, method: str) -> bool:
    return method in HANDLERS.get(handler, {}).get("methods", [])


def confine(handler: str, target: str, root: Path) -> Path:
    """Resolve a request target inside `root`, or refuse."""
    if not HANDLERS.get(handler, {}).get("read_filesystem"):
        raise Refused(f"{handler} has read_filesystem=false")

    candidate = (root / target.lstrip("/")).resolve()
    if root.resolve() not in candidate.parents and candidate != root.resolve():
        raise Refused(f"{handler} tried to leave {root}: {target}")
    return candidate
