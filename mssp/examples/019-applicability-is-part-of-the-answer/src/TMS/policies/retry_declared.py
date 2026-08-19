"""Re-runs a source that declared itself incomplete, with a larger budget."""
POLICY = "retry-declared"
WHAT_IT_DOES_WITH_A_DECLARATION = "re-runs the source with more budget"
RETRY_BUDGET = 2


def apply(runs, rerun):
    out = []
    for run in runs:
        if run["incomplete_because"]:
            out.append({**run, "kept": rerun(run["source"], RETRY_BUDGET)["records"]})
        else:
            out.append({**run, "kept": run["records"]})
    return out
