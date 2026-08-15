"""Which traversal mode this deployment uses."""
import json
import pathlib

_C = json.loads((pathlib.Path(__file__).parent / "policy.json").read_text(encoding="utf-8"))

mode = lambda: _C["mode"]                                              # noqa: E731
silent_is_fatal = lambda: bool(_C["a_silent_traversal_is_fatal"])      # noqa: E731
