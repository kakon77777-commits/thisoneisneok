"""The re-cut: a shelf whose handout strategy is a named unit rather than a flag.

Upstream the choice is a boolean threaded through `__getitem__`, `__setitem__`
and `sync`. Lifting it out is the only structural change; the semantics are
copied, and DMS compares the re-cut against real `shelve` on every run so that
"copied" is a measurement rather than a claim.
"""
import importlib
import pickle

HANDOUTS = ["copy_on_read", "cached_reference"]


def load_handouts():
    loaded, problems = {}, []
    for module_name in HANDOUTS:
        try:
            module = importlib.import_module(f"TMS.handouts.{module_name}")
        except ModuleNotFoundError:
            problems.append(f'handout "{module_name}" has no module - fail closed')
            continue
        for attribute in ("NAME", "HANDS_BACK", "MUTATION_SURVIVES", "make"):
            if not hasattr(module, attribute):
                problems.append(f"{module_name} does not declare {attribute}")
        loaded[module.NAME] = module
    return loaded, problems


def resolve(name, loaded):
    module = loaded.get(name)
    if module is None:
        known = ", ".join(sorted(loaded))
        return None, f'handout "{name}" has no implementation - fail closed (known: {known})'
    return module, None


class Shelf:
    """Same backing mapping shelve.Shelf takes: keys to pickled bytes."""

    def __init__(self, backing, handout):
        self.backing = backing
        self.handout_name = handout.NAME
        self.policy = handout.make(pickle.loads)

    def __setitem__(self, key, value):
        self.backing[key.encode()] = pickle.dumps(value)
        self.policy["remember"](key, value)

    def __getitem__(self, key):
        return self.policy["answer"](key, self.backing[key.encode()])

    def sync(self):
        # Upstream writes the cache back here. The re-cut does the same, and
        # this is the line that makes a mutation through a handed-out object
        # reach the medium at all.
        for key, value in self.policy["items"]():
            self.backing[key.encode()] = pickle.dumps(value)

    def held(self):
        return self.policy["held"]()

    def keys(self):
        return sorted(k.decode() for k in self.backing)


def hands_back_copies(shelf, key):
    """The observation that separates the strategies, and the only cheap one."""
    return shelf[key] is not shelf[key]


def mutation_survives(shelf, key, mutate):
    """The other one. It only fires if the caller thought to mutate."""
    mutate(shelf[key])
    return shelf[key]
