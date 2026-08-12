"""The re-cut: a backend declares what it guarantees, and a schedule declares
what it can reveal. Both declarations are checked by running them.

Upstream neither exists. `dbm.open` picks whatever is available and the caller
gets an interface with no way to ask what it promises.
"""
import importlib

SCHEDULES = ["interleaved", "one_at_a_time"]

# What each backend guarantees, as measured by main.py rather than as read from
# its documentation. A backend absent from this table is not assumed safe.
GUARANTEES = {
    "dbm.dumb": [],
    "dbm.sqlite3": ["index-integrity"],
    "dbm.gnu": ["index-integrity"],
    "dbm.ndbm": [],
}

REQUIREMENTS = {
    "read-modify-write": ["serialised-transaction"],
    "write-distinct-keys": ["index-integrity"],
}


def load_schedules():
    loaded, problems = {}, []
    for module_name in SCHEDULES:
        try:
            module = importlib.import_module(f"TMS.schedules.{module_name}")
        except ModuleNotFoundError:
            problems.append(f'schedule "{module_name}" has no module - fail closed')
            continue
        for attribute in ("NAME", "REVEALS", "order"):
            if not hasattr(module, attribute):
                problems.append(f"{module_name} does not declare {attribute}")
        loaded[module.NAME] = module
    return loaded, problems


def resolve(name, loaded):
    module = loaded.get(name)
    if module is None:
        return None, f'schedule "{name}" has no implementation - fail closed (known: {", ".join(sorted(loaded))})'
    return module, None


def unmet(operation, backend):
    """What the operation needs that the backend does not claim to give."""
    return [need for need in REQUIREMENTS[operation] if need not in GUARANTEES.get(backend, [])]
