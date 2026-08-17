"""Deployment policy: what a declared-incomplete source means here."""
import json
import pathlib

POLICY = json.loads((pathlib.Path(__file__).parent / "policy.json").read_text(encoding="utf-8"))


def is_fatal():
    return POLICY["a_declared_incomplete_source_is"] == "fatal"


def describe():
    return f'{POLICY["deployment"]}: a declared-incomplete source is {POLICY["a_declared_incomplete_source_is"]}'
