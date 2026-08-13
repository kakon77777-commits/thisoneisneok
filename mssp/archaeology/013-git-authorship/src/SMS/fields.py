"""The re-cut: every field declares whether it records a CLAIM or an ACT.

git has no such distinction. A caller reading `%an` gets a string with the same
shape whether a person authored the commit or typed someone's name, and nothing
in the interface offers to say which.
"""
import importlib

FIELDS = ["author", "committer", "trailer", "signature"]


def load():
    loaded, problems = {}, []
    for name in FIELDS:
        try:
            module = importlib.import_module(f"TMS.fields.{name}")
        except ModuleNotFoundError:
            problems.append(f'field "{name}" has no module - fail closed')
            continue
        for attribute in ("NAME", "KIND", "WHAT_IT_RECORDS"):
            if not hasattr(module, attribute):
                problems.append(f"{name} does not declare {attribute}")
        if getattr(module, "KIND", None) not in {"claim", "act"}:
            problems.append(f"{name}: KIND must be claim or act, not {getattr(module, 'KIND', None)!r}")
        loaded[module.NAME] = module
    return loaded, problems


def resolve(name, loaded):
    module = loaded.get(name)
    if module is None:
        return None, f'field "{name}" has no implementation - fail closed (known: {", ".join(sorted(loaded))})'
    return module, None


def separates(rows, field):
    """Does this field take different values for the honest and the impersonating commit?"""
    honest, impersonating = rows[0], rows[1]
    return honest[field] != impersonating[field]
