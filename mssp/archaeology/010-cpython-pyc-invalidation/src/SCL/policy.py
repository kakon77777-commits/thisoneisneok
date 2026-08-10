"""What this deployment writes, and what it refuses to let pass."""
import json
import pathlib

_C = json.loads((pathlib.Path(__file__).parent / "policy.json").read_text(encoding="utf-8"))

mode = lambda: _C["mode"]                                                       # noqa: E731
model_must_match_upstream = lambda: bool(_C["model_must_match_upstream"])        # noqa: E731
unconditional_must_declare = lambda: bool(_C["unconditional_validator_must_declare_itself"])  # noqa: E731
