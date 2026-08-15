"""What this deployment does when a source fails."""
import json
import pathlib

_C = json.loads((pathlib.Path(__file__).parent / "policy.json").read_text(encoding="utf-8"))

on_failure = lambda: _C["on_source_failure"]                          # noqa: E731
must_say_so = lambda: bool(_C["a_degraded_run_must_say_so"])          # noqa: E731
