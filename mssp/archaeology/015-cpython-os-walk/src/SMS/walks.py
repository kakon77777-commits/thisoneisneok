"""The re-cut: a traversal mode declares whether anyone is told."""
import importlib

MODES = ["silent", "reporting"]


def load():
    loaded, problems = {}, []
    for module_name in MODES:
        try:
            module = importlib.import_module(f"TMS.modes.{module_name}")
        except ModuleNotFoundError:
            problems.append(f'mode "{module_name}" has no module - fail closed')
            continue
        for attribute in ("NAME", "REPORTS_ERRORS", "WHAT_THE_CALLER_SEES"):
            if not hasattr(module, attribute):
                problems.append(f"{module_name} does not declare {attribute}")
        loaded[module.NAME] = module
    return loaded, problems


def resolve(name, loaded):
    module = loaded.get(name)
    if module is None:
        return None, f'mode "{name}" has no implementation - fail closed (known: {", ".join(sorted(loaded))})'
    return module, None
