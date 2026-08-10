"""Which guard this deployment runs, and what it treats as fatal."""
import json
import pathlib

_C = json.loads((pathlib.Path(__file__).parent / "policy.json").read_text(encoding="utf-8"))

guard = lambda: _C["guard"]                                              # noqa: E731
FATAL_CODES = {
    "stale-evidence": "stale_evidence_is_fatal",
    "expired-waiver": "expired_waiver_is_fatal",
    "malformed-evidence": "malformed_evidence_is_fatal",
}


def is_fatal(code):
    key = FATAL_CODES.get(code)
    return bool(_C.get(key)) if key else False
