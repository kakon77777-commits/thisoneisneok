"""Run the sources, apply the policy, and measure the incentive — properly.

Example 018 computed

    incentive(unit) = contribution WITH the declaration
                    - contribution with the declaration SUPPRESSED

and returned a number. That number had two meanings and 018 said so in its own
limitations: a unit that declared nothing measured 0, and a unit whose
declaration could not be suppressed also measured 0.

The repair is not a better number. It is that **a measurement returns a value
and its applicability**, and refuses to hand back a value it did not compute.

    {"applicable": True,  "value": 3, "reason": None}
    {"applicable": True,  "value": 0, "reason": None}      <- measured zero
    {"applicable": False, "value": None, "reason": "..."}  <- not measurable
"""
import importlib

SOURCES = ["baked_in", "declares_openly", "never_declares"]
POLICIES = ["ignore_declared", "retry_declared"]

# Deliberately not a number. Anything that tries to add this to a total will
# raise instead of silently contributing nothing.
NOT_APPLICABLE = object()


def load(extra_sources=(), extra_policies=()):
    sources, policies, problems = {}, {}, []

    for name in SOURCES:
        _register(importlib.import_module(f"TMS.sources.{_module_name(name)}"),
                  sources, problems, _check_source, "NAME")
    for module in extra_sources:
        _register(module, sources, problems, _check_source, "NAME")

    for name in POLICIES:
        _register(importlib.import_module(f"TMS.policies.{name}"),
                  policies, problems, _check_policy, "POLICY")
    for module in extra_policies:
        _register(module, policies, problems, _check_policy, "POLICY")

    return sources, policies, problems


def _register(module, registry, problems, checker, key):
    """Check, then register only what is usable.

    Adding the check was not enough on its own: the line that registered the
    module still read the attribute the check had just reported missing, so a
    refused module crashed the loader instead of being refused. A guard that
    does not cover the code after it is not a guard.

    And that repair was still not enough. The first version of this function
    registered a refused module anyway, on the reasoning that later code should
    be able to find it by name — so a source this loader had just REPORTED as
    bad also appeared in the canonical registry. Pragma found it by reading
    (MSSP_Board issue #8) and it reproduced first try. A registry that holds
    what the checker rejected is a registry that disagrees with its own report.
    """
    before = len(problems)
    checker(module, problems)
    name = getattr(module, key, None)
    if name is None:
        return
    if len(problems) > before:
        return  # refused. It does not go in, under any name.
    registry[name] = module


def _module_name(name):
    return {"baked_in": "declaration_is_baked_in"}.get(name, name)


def _check_source(module, problems):
    name = getattr(module, "NAME", None)
    if not name:
        problems.append(f"a source module ({module.__name__}) does not declare NAME")
        return
    for attribute in ("CAN_FAIL_WITH", "HELD", "collect"):
        if not hasattr(module, attribute):
            problems.append(f"{name} does not declare {attribute}")
    if not getattr(module, "CAN_FAIL_WITH", None):
        problems.append(f"{name}: CAN_FAIL_WITH is empty")
    # New in this example. A unit that will not say whether its declaration can
    # be withheld cannot be measured OR reported as unmeasurable, which is the
    # worst of the three states.
    if not isinstance(getattr(module, "DECLARATION_IS_SUPPRESSIBLE", None), bool):
        problems.append(f"{name}: does not say whether its declaration can be "
                        f"suppressed - the harness would report a zero it did not compute")
    for vouch in ("COMPLETE", "IS_COMPLETE", "RETURNS_EVERYTHING"):
        if getattr(module, vouch, None) is True:
            problems.append(f"{name}: declares {vouch} - a unit may declare itself "
                            f"incomplete and may not declare itself complete")


def _check_policy(module, problems):
    # Name it before reading it. A module with no POLICY has to be refused by
    # name-of-the-file, not crash the loader — an unknown shape is a case to
    # classify, not an exception to raise.
    name = getattr(module, "POLICY", None)
    if not name:
        problems.append(f"a policy module ({module.__name__}) does not declare POLICY")
        return
    if not getattr(module, "WHAT_IT_DOES_WITH_A_DECLARATION", None):
        problems.append(f"{name}: does not say what it does with a declaration")
    if not callable(getattr(module, "apply", None)):
        problems.append(f"{name}: has no apply()")


def run_one(module, budget=1, suppress_declaration=False):
    result = module.collect(budget)
    return {
        "source": module.NAME,
        "held": module.HELD,
        "records": result["records"],
        "incomplete_because": None if suppress_declaration else result["incomplete_because"],
    }


def run_all(sources, suppress=()):
    return [run_one(sources[name], 1, suppress_declaration=name in suppress)
            for name in sorted(sources)]


def through(policy, sources, suppress=()):
    runs = run_all(sources, suppress=suppress)
    rerun = lambda name, budget: run_one(sources[name], budget)  # noqa: E731
    applied = policy.apply(runs, rerun)
    return {"rows": applied, "total": sum(len(row["kept"]) for row in applied)}


def contribution(result, name):
    for row in result["rows"]:
        if row["source"] == name:
            return len(row["kept"])
    return 0


def incentive(policy, sources, name):
    """The measurement, with its applicability attached.

    A unit whose declaration is baked into its records cannot be run without
    it, so there is no second arm and nothing to subtract. Returning 0 there
    would be reporting a value that was never computed.
    """
    module = sources[name]
    if not module.DECLARATION_IS_SUPPRESSIBLE:
        return {"source": name, "applicable": False, "value": None,
                "declared": contribution(through(policy, sources), name), "suppressed": None,
                "reason": "the declaration is not a separable field - suppressing it would "
                          "also remove a record, so the two arms would not be comparable"}

    declared = contribution(through(policy, sources), name)
    suppressed = contribution(through(policy, sources, suppress=[name]), name)
    return {"source": name, "applicable": True, "value": declared - suppressed,
            "declared": declared, "suppressed": suppressed, "reason": None}


def measure_all(policy, sources):
    return [incentive(policy, sources, name) for name in sorted(sources)]


def total_incentive(measured):
    """Deliberately refuses rather than treating a non-applicable reading as 0.

    This is the aggregator lesson: classify every input, and refuse the shapes
    you cannot classify instead of defaulting them to zero.
    """
    skipped = [m["source"] for m in measured if not m["applicable"]]
    if skipped:
        raise ValueError("cannot total an incentive across units that were not measured: "
                         + ", ".join(skipped))
    return sum(m["value"] for m in measured)
