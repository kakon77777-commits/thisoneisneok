"""Who may use what.

Read by the router before it returns a decision, so a Route naming a capability
is already a permitted one. The alternative — return the match and let the
loader check — pushes the same check into every caller, and a check that lives
in every caller lives properly in none of them.
"""
from __future__ import annotations

import json
from pathlib import Path

_POLICY = json.loads(Path(__file__).with_name("policy.json").read_text(encoding="utf-8"))
ACTORS: dict[str, dict] = _POLICY["actors"]


def may_use(actor: str, capability: str) -> tuple[bool, str]:
    """Permitted, and the reason when not.

    Returning the reason rather than a bare False is what lets the router put
    "refused, and by what" into the Route — a caller that only learns "no"
    cannot tell a missing permission from a missing rule.
    """
    entry = ACTORS.get(actor)
    if entry is None:
        return False, f"unknown actor {actor!r}"
    if capability not in entry["capabilities"]:
        return False, f"{actor} is not permitted {capability}"
    return True, ""
