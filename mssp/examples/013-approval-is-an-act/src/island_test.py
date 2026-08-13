"""The island test.

    python src/island_test.py

Section 2 is the one this example exists for: each rule declares what it cannot
distinguish, and that declaration is checked by running it over both worlds
rather than read.
"""
import json
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE))

from SCL import policy  # noqa: E402
from SMS import approval  # noqa: E402

CONTRACT = json.loads((HERE / "FMS" / "contract.json").read_text(encoding="utf-8"))
FAILURES = []


def check(label, ok, detail=""):
    print(f"  {'PASS' if ok else 'FAIL'}  {label}{' - ' + detail if detail else ''}")
    if not ok:
        FAILURES.append(label)


LOADED, PROBLEMS = approval.load_rules()
ROWS = {row["rule"]: row for row in approval.run(LOADED)}
separates = lambda name: len(set(ROWS[name]["verdicts"].values())) > 1  # noqa: E731

print("\n== 1. every rule is an island, and FMS's units map matches the tree")
check("all four rules loaded with no problems", not PROBLEMS, "; ".join(PROBLEMS))
rule_dir = HERE / "TMS" / "rules"
files = sorted(f.name for f in rule_dir.iterdir() if f.suffix == ".py" and f.name != "__init__.py")
check("there are four rule files", len(files) == 4, ", ".join(files))
for name in files:
    source = (rule_dir / name).read_text(encoding="utf-8")
    reaches = re.findall(r"^\s*(?:from|import)\s+(\S+)", source, re.M)
    siblings = [r for r in reaches if r.split(".")[0] in {"TMS", "SMS", "SCL", "DMS", "FMS"}]
    check(f"{name} reaches no sibling set", not siblings, ", ".join(reaches) or "no imports at all")
# 011 shipped an FMS that outlived the code it described. This is that check.
for where, expected in CONTRACT["units"].items():
    on_disk = sorted(f.name for f in (HERE / where).iterdir()
                     if f.suffix == ".py" and f.name != "__init__.py")
    check(f"{where}: FMS declares {len(expected)}, on disk {len(on_disk)}",
          on_disk == sorted(expected), ", ".join(on_disk))

print("\n== 2. each rule's declared blindness, checked by running it")
for name, row in sorted(ROWS.items()):
    blind_to_one_author = "one party writing three" in row["declared_blind_to"][1]
    measured_blind = not separates(name)
    check(f"{name}: declares blind to a single author = {blind_to_one_author}, measured {measured_blind}",
          blind_to_one_author == measured_blind,
          f"{row['verdicts']['three parties']} / {row['verdicts']['one author']}")

print("\n== 2b. the drill: a rule that claims to separate and does not must be caught")


class Overclaiming:
    NAME = "reads-everything-decides-nothing"
    READS = ["all of it"]
    CANNOT_DISTINGUISH = ["nothing at all", "an actor whose provenance is itself forged"]

    @staticmethod
    def approved(claim, parties, provenance):
        return True


measured = {world: Overclaiming.approved(None, data["parties"], data["provenance"])
            for world, data in approval.WORLDS.items()}
check("a rule that approves everything while claiming to separate is caught",
      len(set(measured.values())) == 1 and "one party writing three" not in Overclaiming.CANNOT_DISTINGUISH[1],
      f"declared it separates, measured {measured}")

print("\n== 3. how many rules separate the worlds, and what adding fields buys")
separating = [name for name in ROWS if separates(name)]
check("exactly one of four rules separates them", len(separating) == 1, ", ".join(separating))
check("and it is the only one reading something outside the artifacts",
      ROWS[separating[0]]["reads"] == max(row["reads"] for row in ROWS.values()),
      f"{separating[0]} reads {ROWS[separating[0]]['reads']} things")
check("reading MORE of the artifacts does not help - digest-bound reads two and still cannot",
      ROWS["digest-bound-record"]["reads"] > ROWS["identical-content"]["reads"]
      and not separates("digest-bound-record"),
      "the digest binds the approval to the content, which is a real property and not this one")

print("\n== 4. fail closed")
_, problem = approval.resolve("majority-vote", LOADED)
check("an unresolvable rule stops the run", problem is not None, problem or "resolved anyway")
check("SCL names a rule that exists", policy.rule() in LOADED, policy.rule())
check("and the rule it names is one that separates", separates(policy.rule()), policy.rule())

print("\n== 5. what this example does not solve")
print("        MEASURABLE, NOT MEASURED")
print("          - what requiring distinct provenance costs a party legitimately")
print("            acting on another's behalf")
print("        NOT MEASURABLE HERE")
print("          - whether the provenance store is honest. This moves the question")
print("            from the artifacts to who placed them and does not end it;")
print("            archaeology 013 measures where it ends.")
print("          - whether anyone who approved meant it. Nothing reads intent.")

print(f"\n{len(FAILURES)} failure(s)" if FAILURES else "\nall checks passed")
for f in FAILURES:
    print(f"  - {f}")
sys.exit(1 if FAILURES else 0)
