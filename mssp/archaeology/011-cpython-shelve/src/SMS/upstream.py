"""What real shelve does, measured — not what its documentation says it does.

The re-cut in shelf.py is compared against these results cell by cell, so
"the re-cut copies upstream's semantics" is a measurement that can come out
false.
"""
import hashlib
import inspect
import os
import shelve
import tempfile


def _store():
    return os.path.join(tempfile.mkdtemp(), "store")


def probe(writeback):
    """Write, mutate through what a read handed back, reopen, see what survived."""
    path = _store()
    with shelve.open(path, writeback=writeback) as shelf:
        shelf["cart"] = ["apple"]

    with shelve.open(path, writeback=writeback) as shelf:
        shelf["cart"].append("pear")
        identity_separates = shelf["cart"] is not shelf["cart"]
        held = len(getattr(shelf, "cache", {}))

    with shelve.open(path) as shelf:
        survived = list(shelf["cart"])

    return {
        "survived": survived,
        "mutation_survives": survived == ["apple", "pear"],
        "identity_separates": identity_separates,
        "held": held,
    }


def cache_after_pure_reads(count):
    """Reads only. Nothing is written, and the cache grows anyway."""
    path = _store()
    with shelve.open(path, writeback=True) as shelf:
        for index in range(count):
            shelf[f"k{index}"] = [index]
    with shelve.open(path, writeback=True) as shelf:
        marks = {}
        for index in range(count):
            shelf[f"k{index}"]
            if index + 1 in (1, count // 4, count):
                marks[index + 1] = len(shelf.cache)
    return marks


def reads_cause_writes(count, writeback):
    """Open, read every key, close. Did the medium change?

    This replaces a hardcoded `check(..., True, ...)` that asserted the read
    loop wrote nothing. Asserting it was the same defect this lab filed against
    itself on 2026-08-08, and measuring it gives a different answer.
    """
    directory = tempfile.mkdtemp()
    path = os.path.join(directory, "store")
    with shelve.open(path, writeback=True) as shelf:
        for index in range(count):
            shelf[f"k{index}"] = [index]

    def fingerprint():
        return {name: hashlib.sha256(
            open(os.path.join(directory, name), "rb").read()).hexdigest()[:12]
            for name in sorted(os.listdir(directory))}

    before = fingerprint()
    with shelve.open(path, writeback=writeback) as shelf:
        for index in range(count):
            shelf[f"k{index}"]
    after = fingerprint()

    changed = sorted(name for name in before if before.get(name) != after.get(name))
    return {"files": len(before), "changed": changed, "unchanged": len(before) - len(changed)}


def returns_nothing_discriminating():
    """The BP-0004 family: which operations answer the same thing however they went."""
    path = _store()
    with shelve.open(path) as shelf:
        return {
            "__setitem__ (wrote)": shelf.__setitem__("a", [1]),
            "sync() (nothing cached)": shelf.sync(),
            "get('missing')": shelf.get("missing"),
            "get('a') is a live ref": shelf.get("a") is shelf.get("a"),
        }


def structure():
    source = inspect.getsource(shelve)
    return {
        "shelve_py_lines": len(source.splitlines()),
        "getitem_lines": len(inspect.getsource(shelve.Shelf.__getitem__).splitlines()),
        "setitem_lines": len(inspect.getsource(shelve.Shelf.__setitem__).splitlines()),
        "writeback_default": inspect.signature(shelve.open).parameters["writeback"].default,
        "public_classes": sorted(
            name for name, value in vars(shelve).items()
            if isinstance(value, type) and not name.startswith("_")
            and value.__module__ == "shelve"),
    }
