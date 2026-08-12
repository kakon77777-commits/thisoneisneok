"""What the real dbm backends do under a written-down schedule.

Two failures are measured separately because they are separate guarantees that
both get called "safe for concurrent use":

  lost-update — two increments from 0 end at 1; the data is intact and wrong
  torn-index  — after interleaved writes of distinct keys, keys are missing
"""
import inspect
import os
import tempfile

BACKENDS = {}
for _name in ("dbm.dumb", "dbm.sqlite3", "dbm.gnu", "dbm.ndbm"):
    try:
        BACKENDS[_name] = __import__(_name, fromlist=["open"])
    except ImportError:
        pass


def _fresh():
    return os.path.join(tempfile.mkdtemp(), "store")


def lost_update(module, schedule_order):
    """Read-modify-write through two handles, following the given order.

    The order is a list of writer indices; each writer's steps are read, modify,
    write. Nothing is raced for, so the result is a fact about the code.
    """
    path = _fresh()
    with module.open(path, "c") as db:
        db[b"n"] = b"0"
    try:
        handles = [module.open(path, "w"), module.open(path, "w")]
        held = [None, None]
        cursor = [0, 0]
        steps = [
            lambda who: held.__setitem__(who, int(handles[who][b"n"])),
            lambda who: held.__setitem__(who, held[who] + 1),
            lambda who: handles[who].__setitem__(b"n", str(held[who]).encode()),
        ]
        for who in schedule_order:
            if cursor[who] < len(steps):
                steps[cursor[who]](who)
                cursor[who] += 1
        for who, handle in enumerate(handles):
            while cursor[who] < len(steps):
                steps[cursor[who]](who)
                cursor[who] += 1
            handle.close()
        with module.open(path, "r") as db:
            return {"final": int(db[b"n"]), "lost": 2 - int(db[b"n"]), "error": None}
    except Exception as error:                       # noqa: BLE001
        return {"final": None, "lost": None, "error": f"{type(error).__name__}: {error}"}


def torn_index(module, rounds=40):
    """Interleave writes of DIFFERENT keys through two handles, then count."""
    path = _fresh()
    with module.open(path, "c") as db:
        db[b"seed"] = b"1"
    try:
        first, second = module.open(path, "w"), module.open(path, "w")
        for index in range(rounds):
            (first if index % 2 == 0 else second)[f"k{index}".encode()] = b"v"
        first.close()
        second.close()
        with module.open(path, "r") as db:
            survived = len(db.keys())
        return {"survived": survived, "expected": rounds + 1,
                "missing": rounds + 1 - survived, "error": None}
    except Exception as error:                       # noqa: BLE001
        return {"survived": None, "expected": rounds + 1, "missing": None,
                "error": f"{type(error).__name__}: {error}"}


def declaration(module):
    """Where, if anywhere, the module says something about concurrent access."""
    source = inspect.getsource(module)
    doc = module.__doc__ or ""
    mentions = [line.strip() for line in doc.splitlines() if "concurrent" in line.lower()]
    return {
        "lines": len(source.splitlines()),
        "says_in_docstring": mentions[0] if mentions else None,
        "locking_primitives": [token for token in ("flock", "msvcrt", "LOCK_EX", "fcntl")
                               if token in source],
    }


def which_backend_shelve_uses():
    import dbm
    import shelve
    path = _fresh()
    with shelve.open(path) as shelf:
        shelf["k"] = 1
    return dbm.whichdb(path)
