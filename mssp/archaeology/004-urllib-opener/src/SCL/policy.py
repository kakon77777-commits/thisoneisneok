"""Which handler may serve which scheme, and which schemes exist at all.

The second half is what upstream has no place for. `htp_open` binds `htp`
because binding is name-driven and there is no set of real schemes to check the
name against — so a typo in the protocol produces a handler that is registered,
reachable by nothing, and reported as fine.
"""
from __future__ import annotations

import json
from pathlib import Path

_POLICY = json.loads(Path(__file__).with_name("policy.json").read_text(encoding="utf-8"))
SCHEMES: set[str] = set(_POLICY["schemes"])
HANDLERS: dict[str, dict] = _POLICY["handlers"]


def may_serve(handler: str, scheme: str) -> tuple[bool, str]:
    if scheme not in SCHEMES:
        return False, f"unknown scheme; this system serves {sorted(SCHEMES)}"
    entry = HANDLERS.get(handler)
    if entry is None:
        return False, f"unknown handler {handler!r}"
    if scheme not in entry["may_serve"]:
        return False, f"{handler} is not permitted {scheme}"
    return True, ""
