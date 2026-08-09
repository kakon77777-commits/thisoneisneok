"""Which observer, and who may clear the channel's memory."""
import json
import pathlib

_C = json.loads((pathlib.Path(__file__).parent / "policy.json").read_text(encoding="utf-8"))

permits = lambda name: name in _C["permitted_observers"]          # noqa: E731
default_observer = lambda: _C["default_observer"]                 # noqa: E731
may_clear = lambda actor: actor in _C["may_clear_memory"]         # noqa: E731
