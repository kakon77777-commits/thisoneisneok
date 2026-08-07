"""What this deployment permits. Reads the file at run time."""
import json
import pathlib

_CONFIG = json.loads((pathlib.Path(__file__).parent / "policy.json").read_text(encoding="utf-8"))


def tolerance_cents():
    return _CONFIG["tolerance_cents"]


def permitted_reports():
    return list(_CONFIG["permitted_reports"])


def permits(report):
    return report in _CONFIG["permitted_reports"]
