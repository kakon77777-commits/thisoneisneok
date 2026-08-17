"""The island test.

    python src/island_test.py

Section 3 is the control. Section 4 is the rule the example exists for: a unit
may declare itself incomplete and may not declare itself complete. Section 6
asserts what this cannot see, so that a change in the limit goes red.
"""
import json
import pathlib
import re
import sys

from SMS import gather
from SCL import policy
from DMS import report
from TMS.sources import quiet_truncation, short_page, truncated_page

HERE = pathlib.Path(__file__).parent
CONTRACT = json.loads((HERE / "FMS" / "contract.json").read_text(encoding="utf-8"))
FAILURES = []
RAN = [0]


def check(label, ok, detail=""):
    RAN[0] += 1
    print(f'  {"PASS" if ok else "FAIL"}  {label}{f" - {detail}" if detail else ""}')
    if not ok:
        FAILURES.append(label)


loaded, problems = gather.load()
runs = gather.run_all(loaded)
row = {r["source"]: r for r in runs}

print("\n== 1. every source is an island, and FMS matches the tree")
check("loading raised no problems", not problems, "; ".join(problems))
for unit, declared in CONTRACT["units"].items():
    directory = HERE.joinpath(*unit.split("/"))
    on_disk = sorted(p.name for p in directory.glob("*.py") if p.name != "__init__.py")
    check(f"{unit}: FMS declares what is on disk", on_disk == sorted(declared),
          f'disk {", ".join(on_disk)} | FMS {", ".join(sorted(declared))}')
    for name in on_disk:
        body = directory.joinpath(name).read_text(encoding="utf-8")
        siblings = [n[:-3] for n in on_disk if n != name]
        reached = [s for s in siblings if re.search(rf"\bimport\b.*\b{s}\b", body)]
        check(f"{unit}/{name} reaches no sibling", not reached, ", ".join(reached))
        check(f"{unit}/{name} reaches no other set",
              not re.search(r"\b(from|import)\s+(SMS|DMS|SCL|FMS)\b", body))

print("\n== 2. finished and complete are two axes")
check("every source finished", all(r["finished"] for r in runs))
check("and none of them failed", all(r["outcome"] == "worked" for r in runs))
check("so the outcome column separates nothing today",
      len({r["outcome"] for r in runs}) == 1, ", ".join(sorted({r["outcome"] for r in runs})))
check("the completeness column does",
      len({r["completeness"] for r in runs}) == 2,
      " | ".join(sorted({r["completeness"] for r in runs})))
check("truncated-page is the one that declared", row["truncated-page"]["reason"] == "more-after-cursor")
absent_row = gather.run(loaded["truncated-page"], absent=True)
check("removed, it is absent and declares nothing",
      absent_row["outcome"] == "absent" and absent_row["completeness"] is None)

print("\n== 3. the control - the same number, finished just as cleanly")
short, trunc = row["short-page"], row["truncated-page"]
check("short-page returned two records", len(short["records"]) == 2)
check("and it finished", short["finished"] is True)
check("and it is genuinely complete - the control", short["reason"] is None)
check("truncated-page returned two records as well", len(trunc["records"]) == 2)
check("and it finished just as cleanly", trunc["finished"] is True)
check("so neither the count nor `finished` separates them",
      len(short["records"]) == len(trunc["records"]) and short["finished"] == trunc["finished"])
check("only the declaration does",
      short["completeness"] != trunc["completeness"],
      f'{short["completeness"]} vs {trunc["completeness"]}')

print("\n== 4. a unit may declare itself incomplete and may not declare itself complete")


def drill_source(name, **attributes):
    module = type(sys)(name)
    module.NAME = name
    module.CAN_FAIL_WITH = ["x"]
    module.collect = lambda: {"records": [{"from": name, "id": "d-1"}], "incomplete_because": None}
    for key, value in attributes.items():
        setattr(module, key, value)
    return module


for vouch in ("COMPLETE", "IS_COMPLETE", "RETURNS_EVERYTHING"):
    _, drilled = gather.load(extra=[drill_source(f"drill-{vouch.lower()}", **{vouch: True})])
    check(f"DRILL: a source declaring {vouch} is refused",
          any(f"declares {vouch}" in p for p in drilled))
_, honest = gather.load(extra=[drill_source("drill-honest")])
check("and a source that declares neither is accepted", not honest)
_, silent = gather.load(extra=[drill_source("drill-silent", CAN_FAIL_WITH=[])])
check("DRILL: an empty CAN_FAIL_WITH is still refused (improvement 13)",
      any("CAN_FAIL_WITH is empty" in p for p in silent))
check("the self-penalising direction is taken on trust, and it is the only one",
      trunc["completeness"] == gather.DECLARED_INCOMPLETE
      and gather.NOT_KNOWN_OTHERWISE != "complete")
check("there is no verified-complete value anywhere in the vocabulary",
      "complete" not in {gather.DECLARED_INCOMPLETE, gather.NOT_KNOWN_OTHERWISE})

print("\n== 5. the number is a floor and the report says so")
total = sum(len(r["records"]) for r in runs)
at_least = gather.at_least_incomplete(runs)
sentence = report.floor(at_least, total)
check("the floor counts only what was declared", at_least == 2, f"{at_least} of {total}")
check('the report says "at least"', "at least" in sentence)
check('and says the word "FLOOR"', "FLOOR" in sentence)
check("and states why it is not a count", "truncated and says nothing" in sentence)
check("the true number is greater - quiet-truncation is truncated too",
      at_least < at_least + len(row["quiet-truncation"]["records"]))
check("removing the declaring source removes the warning, not the truncation",
      gather.at_least_incomplete(gather.run_all(loaded, absent=["truncated-page"])) == 0)

print("\n== 6. what this cannot see, asserted so it stays measured")
quiet = row["quiet-truncation"]
check("quiet-truncation is truncated in the same way truncated-page is",
      quiet_truncation.TRUTH_THE_COLLECTOR_CANNOT_SEE.startswith("there is a cursor"))
check("it declares nothing", quiet["reason"] is None)
check("and every field the collector reads matches short-page, which IS complete",
      (quiet["outcome"], quiet["finished"], len(quiet["records"]), quiet["completeness"])
      == (short["outcome"], short["finished"], len(short["records"]), short["completeness"]),
      "the limit named in FMS non_goals - if this goes red, the limit changed and the text must too")
check("the two source files differ, so the sameness is in the observation and not the tree",
      truncated_page.collect()["incomplete_because"] != quiet_truncation.collect()["incomplete_because"])
check("SCL cannot refuse it, and says that in words",
      "truncated and silent" in json.loads(
          (HERE / "SCL" / "policy.json").read_text(encoding="utf-8"))["what_this_deployment_cannot_refuse"])
check("and the deployment does refuse the declared one", policy.is_fatal())

print()
if FAILURES:
    print(f'  {len(FAILURES)} FAILED: {" | ".join(FAILURES)}')
    sys.exit(1)
print(f"  {RAN[0]} checks passed - {len(runs)} sources, all finished, not all complete")
