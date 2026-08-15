"""Load the sources, run them, and keep the three outcomes apart.

The one rule this example adds: a run has three outcomes per unit, not two.
worked / empty / failed. Collapsing `failed` into `empty` is what makes a
degraded run report as a successful one.
"""
import importlib

SOURCES = ["local_files", "remote_index", "archive_dump"]


def load():
    loaded, problems = {}, []
    for module_name in SOURCES:
        try:
            module = importlib.import_module(f"TMS.sources.{module_name}")
        except ModuleNotFoundError:
            problems.append(f'source "{module_name}" has no module - fail closed')
            continue
        for attribute in ("NAME", "CAN_FAIL_WITH", "collect"):
            if not hasattr(module, attribute):
                problems.append(f"{module_name} does not declare {attribute}")
        if not getattr(module, "CAN_FAIL_WITH", None):
            problems.append(f"{module_name}: CAN_FAIL_WITH is empty - a unit that cannot say "
                            f"what a bad day looks like cannot be reported as degraded")
        loaded[module.NAME] = module
    return loaded, problems


def resolve(name, loaded):
    module = loaded.get(name)
    if module is None:
        return None, f'source "{name}" has no implementation - fail closed (known: {", ".join(sorted(loaded))})'
    return module, None


def gather(loaded, absent=()):
    """Run every source that has not been removed, and classify each outcome."""
    rows = []
    for name in sorted(loaded):
        if name in absent:
            rows.append({"source": name, "outcome": "absent", "records": 0, "failed": None})
            continue
        result = loaded[name].collect()
        outcome = "failed" if result["failed"] else ("worked" if result["records"] else "empty")
        rows.append({"source": name, "outcome": outcome,
                     "records": len(result["records"]), "failed": result["failed"]})
    return rows


def total(rows):
    return sum(row["records"] for row in rows)


def degraded(rows):
    return [row for row in rows if row["outcome"] == "failed"]
