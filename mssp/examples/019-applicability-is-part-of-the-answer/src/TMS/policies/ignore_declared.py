"""Reads the declaration and does nothing differently.

This is the control policy. Under it, a unit that declares has an incentive of
zero and that zero is MEASURED - both arms of the counterfactual ran and agreed.
Without it, a zero would only ever mean "nothing to measure", and section 4
could not come out badly.
"""
POLICY = "ignore-declared"
WHAT_IT_DOES_WITH_A_DECLARATION = "notes it and changes nothing"


def apply(runs, rerun):
    return [{**run, "kept": run["records"]} for run in runs]
