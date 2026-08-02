"""What each capability is allowed to do.

Permission lives here rather than inside the capability that holds it, because a
module that grants itself a permission is describing a hope. `policy.json` is
data a runtime can read; these functions are the checks it can call.

The rule worth the trouble is `pace-requires-network`. It turns "the promotion
should not cost the anchor checker anything" from a design intention into an
assertion that fails a run — see the README's account of what promoting pacing
to SMS actually broke.
"""
from __future__ import annotations

import json
from pathlib import Path

_POLICY = json.loads((Path(__file__).with_name("policy.json")).read_text(encoding="utf-8"))
CAPABILITIES: dict[str, dict] = _POLICY["capabilities"]


class PermissionError_(Exception):
    """Raised when a capability does something its policy entry does not allow."""


def may_use_network(capability: str) -> bool:
    return bool(CAPABILITIES.get(capability, {}).get("network", False))


def may_fail_run(capability: str) -> bool:
    return bool(CAPABILITIES.get(capability, {}).get("may_fail_run", False))


def assert_pacing_is_earned(waits_by_capability: dict[str, int]) -> None:
    """A capability that may not reach the network must not have waited for one.

    This is the check that caught the first attempt at the promotion. Pacing had
    been moved into SMS and the pipeline called it once per link, before dispatch
    — which is the shape that reads cleanest and is wrong, because it charges the
    delay to whichever capability happens to be next rather than to the one that
    is about to open a connection.
    """
    offenders = [
        f"{cap} waited {n}x with network=false"
        for cap, n in sorted(waits_by_capability.items())
        if n and not may_use_network(cap)
    ]
    if offenders:
        raise PermissionError_(
            "SCL rule 'pace-requires-network' violated: " + "; ".join(offenders)
        )
