"""Walk the history, ask each exemption in the declared order, judge with the named guard."""
import importlib

from SMS import guards


def load_exemptions(order):
    """Resolve rule ids to modules, and check that each module agrees it is that rule.

    The RULE-vs-order comparison is here because 008 taught it the expensive
    way: an id that is resolved but never checked against what actually runs is
    a name with nothing behind it.
    """
    loaded, problems = [], []
    for rule in order:
        module_name = "TMS.exemptions." + rule.replace("-", "_")
        try:
            module = importlib.import_module(module_name)
        except ModuleNotFoundError:
            problems.append(f'exemption "{rule}" has no module - fail closed')
            continue
        declared = getattr(module, "RULE", None)
        if declared != rule:
            problems.append(f'{module_name} declares RULE={declared!r} but was ordered as {rule!r}')
            continue
        loaded.append((rule, module))
    return loaded, problems


def first_evidence(change, ctx, exemptions):
    for _rule, module in exemptions:
        evidence = module.look(change, ctx)
        if evidence is not None:
            return evidence
    return None


def judged_changes(contract):
    """Every drifting change in the history, flattened, with its round attached."""
    for rnd in contract["history"]["rounds"]:
        for change in rnd["changes"]:
            if not change.get("drift"):
                continue
            yield {"round": rnd["id"], "date": rnd["date"],
                   "path": change["path"], "kind": change["kind"]}


def review(contract, guard_name):
    guard, problem = guards.resolve(guard_name)
    if problem:
        return None, [problem]

    exemptions, problems = load_exemptions(contract["exemption_order"])
    ctx = {"rounds": contract["history"]["rounds"], "declarations": contract["declarations"]}
    view = {"unconditional_requires": contract["evidence_contract"]["unconditional_requires"]}

    rows = []
    for change in judged_changes(contract):
        evidence = first_evidence(change, ctx, exemptions)
        rows.append({**change, "evidence": evidence, **guard(change, evidence, view)})
    return rows, problems


def verdict_values(rows):
    """How many distinct verdicts a guard produced over this history.

    One means it could not have come out any other way here - which is not proof
    that it never can, only that this history never made it.
    """
    return sorted({row["verdict"] for row in rows})
