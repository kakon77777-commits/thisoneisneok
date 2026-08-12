"""The island test, and the drill that lets the schedule's own claim fail.

    python src/island_test.py

Section 3 is the finding: a backend can hold index integrity and lose an update
under the same schedule, because a lost update happens BETWEEN two operations
that are each perfectly atomic.
"""
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE))

from SCL import policy  # noqa: E402
from SMS import backends, upstream  # noqa: E402

FAILURES = []


def check(label, ok, detail=""):
    print(f"  {'PASS' if ok else 'FAIL'}  {label}{' - ' + detail if detail else ''}")
    if not ok:
        FAILURES.append(label)


SCHEDULES, PROBLEMS = backends.load_schedules()

print("\n== 1. every schedule is an island and declares what it can reveal")
check("both schedules loaded with no problems", not PROBLEMS, "; ".join(PROBLEMS))
schedule_dir = HERE / "TMS" / "schedules"
files = sorted(f for f in schedule_dir.iterdir() if f.suffix == ".py" and f.name != "__init__.py")
check("there are two schedule files", len(files) == 2, ", ".join(f.stem for f in files))
for f in files:
    reaches = re.findall(r"^\s*(?:from|import)\s+(\S+)", f.read_text(encoding="utf-8"), re.M)
    siblings = [r for r in reaches if r.split(".")[0] in {"TMS", "SMS", "SCL", "DMS", "FMS"}]
    check(f"{f.stem} reaches no sibling set", not siblings,
          ", ".join(reaches) or "no imports at all")
for name, module in sorted(SCHEDULES.items()):
    check(f"{name} declares what it reveals", isinstance(module.REVEALS, list), str(module.REVEALS))

print("\n== 2. that declaration is checked by running it")


def reveals_lost_update(order):
    return any(upstream.lost_update(module, order)["lost"] for module in upstream.BACKENDS.values())


for name, module in sorted(SCHEDULES.items()):
    measured = reveals_lost_update(module.order(2, 3))
    declared = "lost-update" in module.REVEALS
    check(f"{name}: declared lost-update={declared}, measured {measured}", measured == declared,
          "on the backends this machine has")

print("\n== 2b. the drill: a schedule that overclaims must be caught")


class Overclaiming:
    NAME = "sequential-but-claims-otherwise"
    REVEALS = ["lost-update"]

    @staticmethod
    def order(writers, steps_each):
        return [who for who in range(writers) for _ in range(steps_each)]


check("a sequential schedule declaring lost-update is caught",
      reveals_lost_update(Overclaiming.order(2, 3)) is False
      and "lost-update" in Overclaiming.REVEALS,
      "declared it reveals lost updates, revealed none")

print("\n== 3. two guarantees, and one backend holds exactly one of them")
interleaved = SCHEDULES["interleaved"].order(2, 3)
rows = {}
for name, module in sorted(upstream.BACKENDS.items()):
    rows[name] = {"lost": upstream.lost_update(module, interleaved)["lost"],
                  "missing": upstream.torn_index(module)["missing"]}
    print(f"        {name:<14} lost updates {rows[name]['lost']}   "
          f"keys missing {rows[name]['missing']}")
check("every available backend loses an update under this schedule",
      all(row["lost"] for row in rows.values()),
      ", ".join(f"{n}={r['lost']}" for n, r in rows.items()))
integrity = {name: row["missing"] == 0 for name, row in rows.items()}
check("and they do NOT agree on index integrity", len(set(integrity.values())) > 1,
      ", ".join(f"{n}={'holds' if ok else 'loses'}" for n, ok in integrity.items()))
check("so locking is real and does not address lost updates",
      rows.get("dbm.sqlite3", {}).get("missing") == 0
      and bool(rows.get("dbm.sqlite3", {}).get("lost")),
      "dbm.sqlite3 keeps every key and still ends at 1")

print("\n== 4. THE CONTROL: the sequential schedule reveals nothing, on any backend")
sequential = SCHEDULES["one-at-a-time"].order(2, 3)
finals = {name: upstream.lost_update(module, sequential)["final"]
          for name, module in sorted(upstream.BACKENDS.items())}
check("every backend ends at 2 under one-at-a-time", all(v == 2 for v in finals.values()),
      ", ".join(f"{n}={v}" for n, v in finals.items()))
check("so what the suite can produce, not what it asserts, decides what is visible",
      all(v == 2 for v in finals.values()) and all(row["lost"] for row in rows.values()))

print("\n== 5. where each module writes down its gap")
for name, module in sorted(upstream.BACKENDS.items()):
    info = upstream.declaration(module)
    print(f"        {name:<14} {info['lines']:>4} lines   "
          f"{'docstring TO DO' if info['says_in_docstring'] else 'nowhere'}   "
          f"locking: {', '.join(info['locking_primitives']) or 'none in this source'}")
declared = {name: bool(upstream.declaration(module)["says_in_docstring"])
            for name, module in upstream.BACKENDS.items()}
check("the backend that declares its gap is the one with the larger gap",
      declared.get("dbm.dumb") and not declared.get("dbm.sqlite3"),
      "dbm.dumb says it in a TO DO; dbm.sqlite3 says nothing and holds integrity")

print("\n== 6. fail closed")
_, problem = backends.resolve("random-order", SCHEDULES)
check("an unresolvable schedule stops the run", problem is not None, problem or "resolved anyway")
check("SCL names a schedule that exists", policy.schedule() in SCHEDULES, policy.schedule())
absent = [name for name in backends.GUARANTEES if name not in upstream.BACKENDS]
check("backends this machine lacks are reported, not assumed", bool(absent),
      f"untested here: {', '.join(sorted(absent))}")

print("\n== 7. what this entry cannot see")
print("        MEASURABLE, NOT MEASURED")
print("          - behaviour under a real scheduler rather than this written one")
print("          - what the sqlite backend's locking costs in throughput")
print("        NOT MEASURABLE HERE")
print("          - frequency. Reproducing a lost update says nothing about how")
print("            often two writers actually meet.")
print("          - the absent backends. Every statement about dbm.gnu and")
print("            dbm.ndbm would be a guess, so none is made.")

print(f"\n{len(FAILURES)} failure(s)" if FAILURES else "\nall checks passed")
for f in FAILURES:
    print(f"  - {f}")
sys.exit(1 if FAILURES else 0)
