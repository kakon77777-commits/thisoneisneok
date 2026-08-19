"""Deployment policy: which policy runs, and what an unmeasurable unit means."""
import json
import pathlib

POLICY = json.loads((pathlib.Path(__file__).parent / "policy.json").read_text(encoding="utf-8"))


def policy_name():
    return POLICY["policy"]


def assumption():
    return POLICY["assumes_declarations_are"]


def unmeasurable_is_fatal():
    return POLICY["an_unmeasurable_unit_is"] == "fatal"


def describe():
    return (f'{POLICY["deployment"]}: apply {POLICY["policy"]}, assuming declarations are '
            f'{POLICY["assumes_declarations_are"]}')


def contradicts(measured):
    """Only a MEASURED positive incentive contradicts the assumption.

    A reading that was never taken cannot contradict anything, and must not be
    allowed to look like agreement either.
    """
    if POLICY["assumes_declarations_are"] != "self-penalising":
        return None
    if not measured["applicable"]:
        return None
    if measured["value"] > 0:
        return (f'declaring left {measured["source"]} better off by {measured["value"]} '
                f'record(s) ({measured["suppressed"]} suppressed -> {measured["declared"]} declared)')
    return None
