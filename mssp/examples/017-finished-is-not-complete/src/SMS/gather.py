"""Run the sources, and keep `finished` and `complete` apart.

Example 016 established that `finished` is observed here and never declared by
the unit. Completeness cannot be observed here at all — nothing outside a
source can see the cursor it did not follow.

So this module applies one rule, and it is the whole example:

    a unit may declare itself INCOMPLETE, and may not declare itself COMPLETE.

A declaration that can only make the report worse for the declarer is taken on
trust. One that makes it better is refused, because there is nothing to check
it against. The consequence is that the resulting number is a FLOOR and the
report has to say so.
"""
import importlib

SOURCES = ["full_page", "quiet_truncation", "short_page", "truncated_page"]

# The two values the completeness column may hold. There is no third: nothing
# here can put a source in a "verified complete" state, so the report never
# claims one.
DECLARED_INCOMPLETE = "no - declared"
NOT_KNOWN_OTHERWISE = "not known to be otherwise"


def load(extra=()):
    loaded, problems = {}, []
    for module_name in [*SOURCES, *extra]:
        module = module_name if not isinstance(module_name, str) else (
            importlib.import_module(f"TMS.sources.{module_name}"))
        for attribute in ("NAME", "CAN_FAIL_WITH", "collect"):
            if not hasattr(module, attribute):
                problems.append(f"a source does not declare {attribute}")
        if not getattr(module, "CAN_FAIL_WITH", None):
            problems.append(f"{module.NAME}: CAN_FAIL_WITH is empty - a unit that cannot say "
                            f"what a bad day looks like cannot be reported as degraded")
        # The self-serving direction, refused. A unit vouching for its own
        # completeness is a declaration nothing outside it can check.
        for vouch in ("COMPLETE", "IS_COMPLETE", "RETURNS_EVERYTHING"):
            if getattr(module, vouch, None) is True:
                problems.append(f"{module.NAME}: declares {vouch} - a unit may declare itself "
                                f"incomplete and may not declare itself complete")
        loaded[module.NAME] = module
    return loaded, problems


def run(module, absent=False):
    if absent:
        return {"source": module.NAME, "outcome": "absent", "records": [],
                "finished": None, "completeness": None, "reason": None}

    records, error = [], None
    reason = None
    try:
        result = module.collect()
        for record in result["records"]:
            if not isinstance(record, dict) or record.get("from") != module.NAME:
                raise ValueError(f'a record without a usable "from" reached the collector '
                                 f'(got {record.get("from")!r}, expected {module.NAME!r})')
            records.append(record)
        reason = result.get("incomplete_because")
    except Exception as raised:  # noqa: BLE001 - the collector observes, it does not re-raise
        error = str(raised)

    finished = error is None
    if not finished and records:
        outcome = "partial"
    elif not finished:
        outcome = "failed"
    elif records:
        outcome = "worked"
    else:
        outcome = "empty"

    completeness = DECLARED_INCOMPLETE if reason else NOT_KNOWN_OTHERWISE
    return {"source": module.NAME, "outcome": outcome, "records": records,
            "finished": finished, "completeness": completeness,
            "reason": reason or error}


def run_all(loaded, absent=()):
    return [run(loaded[name], absent=name in absent) for name in sorted(loaded)]


def at_least_incomplete(rows):
    """A FLOOR, never a count.

    Records known to come from a source that said it was incomplete. A source
    that is truncated and silent lands in the same column as a complete one, so
    the true number is greater than or equal to this and nothing here can say
    by how much.
    """
    return sum(len(row["records"]) for row in rows
               if row["completeness"] == DECLARED_INCOMPLETE)
