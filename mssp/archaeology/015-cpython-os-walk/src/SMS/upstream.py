"""What os.walk actually does, measured on this interpreter.

Nothing here needs special permissions: a directory that does not exist, and a
directory that disappears between the top-level listing and the visit. Both are
ordinary in a running system.
"""
import inspect
import os
import shutil
import tempfile


def build_tree(names=("a", "b", "c")):
    root = tempfile.mkdtemp()
    for name in names:
        os.makedirs(os.path.join(root, name))
        open(os.path.join(root, name, f"{name}.txt"), "w").close()
    return root


def empty_versus_missing():
    """Two causes of 'the walk found nothing', and what survives the idiomatic loop."""
    root = tempfile.mkdtemp()
    empty = os.path.join(root, "empty_dir")
    os.makedirs(empty)
    missing = os.path.join(root, "does-not-exist")

    def collected(top):
        found = []
        for _, _, files in os.walk(top):
            found.extend(files)
        return found

    return {
        "empty": {"rows": len(list(os.walk(empty))), "files": len(collected(empty))},
        "missing": {"rows": len(list(os.walk(missing))), "files": len(collected(missing))},
        "raised": None,
    }


def vanishing_subdirectory(onerror=None):
    """Start the walk, delete a subdirectory before it is visited, keep walking."""
    root = build_tree()
    errors = []
    walker = os.walk(root, onerror=onerror(errors) if onerror else None)
    next(walker)                                     # the top level lists a, b, c
    shutil.rmtree(os.path.join(root, "b"))           # b is gone before its turn
    found = []
    for _, _, files in walker:
        found.extend(files)
    return {"files": sorted(found), "errors": errors, "raised": None}


def signature():
    return str(inspect.signature(os.walk))


def onerror_lines():
    source = inspect.getsource(os.walk)
    return [line.strip() for line in source.splitlines()
            if "onerror" in line and line.strip().startswith(("if", "return"))]
