"""Which handout this deployment uses, and what it refuses to let pass."""
import json
import pathlib

_C = json.loads((pathlib.Path(__file__).parent / "policy.json").read_text(encoding="utf-8"))

handout = lambda: _C["handout"]                                                  # noqa: E731
declaration_must_match_behaviour = lambda: bool(_C["declaration_must_match_behaviour"])  # noqa: E731
recut_must_match_upstream = lambda: bool(_C["recut_must_match_upstream"])        # noqa: E731
