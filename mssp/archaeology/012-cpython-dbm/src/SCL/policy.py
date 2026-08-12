"""Which schedule this deployment runs, and what it refuses to let pass."""
import json
import pathlib

_C = json.loads((pathlib.Path(__file__).parent / "policy.json").read_text(encoding="utf-8"))

schedule = lambda: _C["schedule"]                                                    # noqa: E731
declarations_must_match_behaviour = lambda: bool(_C["declarations_must_match_behaviour"])  # noqa: E731
