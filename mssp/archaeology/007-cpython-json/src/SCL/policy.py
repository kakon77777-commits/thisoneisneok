"""What this deployment permits."""
import json
import pathlib

_C = json.loads((pathlib.Path(__file__).parent / "policy.json").read_text(encoding="utf-8"))


def accelerator_allowed():
    return _C["accelerator"] == "allow"


def error_text_must_match():
    return bool(_C["error_text_must_match"])
