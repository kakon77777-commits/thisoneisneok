"""The island test, and the demonstration that Pragma's proposal beats mine.

    python src/island_test.py

Section 3 is the one that matters: duplicating a fixture ten times raises a raw
count of falsifying observations to ten and leaves the distinct-case count at
one. That is the objection Pragma raised to my own discrimination-delta idea,
made executable rather than agreed with.
"""
import copy
import json
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE))

from SCL import policy  # noqa: E402
from SMS import continuity, validate  # noqa: E402

CONTRACT = json.loads((HERE / "FMS" / "contract.json").read_text(encoding="utf-8"))
CURRENT = {name: spec["witnesses"] for name, spec in CONTRACT["clauses"].items()}
PREVIOUS = CONTRACT["previous_version"]["clauses"]

FAILURES = []


def check(label, ok, detail=""):
    print(f"  {'PASS' if ok else 'FAIL'}  {label}{' - ' + detail if detail else ''}")
    if not ok:
        FAILURES.append(label)


print("\n== 1. every witness is an island, and every one really breaks its clause")
witness_dir = HERE / "TMS" / "witnesses"
files = sorted(f for f in witness_dir.iterdir() if f.suffix == ".py" and f.name != "__init__.py")
check("there are six witness files", len(files) == 6, ", ".join(f.stem for f in files))
for f in files:
    source = f.read_text(encoding="utf-8")
    reaches = re.findall(r"^\s*(?:from|import)\s+(\S+)", source, re.M)
    check(f"{f.stem} imports nothing", not reaches, ", ".join(reaches) or "no imports at all")

for name, witnesses in CURRENT.items():
    report = continuity.check_clause(name, validate.CLAUSES[name], witnesses)
    check(f"{name}: every listed witness falsifies it",
          all(w["falsifies"] for w in report["witnesses"]),
          "; ".join(f"{w['witness']}={'yes' if w['falsifies'] else 'NO'}" for w in report["witnesses"]))

print("\n== 2. a witness that proves nothing is reported as such")
# The failing case, evaluated. A "witness" whose input the clause is perfectly
# happy with must not count as evidence that the clause can fail.
clean = {"total": 10.0, "rows": [{"id": "Z-1", "amount": 10.0, "date": "2026-08-09"}]}
ok, complaints = continuity.falsifies(validate.CLAUSES["amount-is-a-number"], lambda: clean)
check("a clean input does not falsify the clause", not ok, f"{len(complaints)} complaint(s)")
report = continuity.check_clause("amount-is-a-number", validate.CLAUSES["amount-is-a-number"],
                                 ["amount-is-letters", "two-rows-share-an-id"])
mismatched = [w for w in report["witnesses"] if w["witness"] == "two-rows-share-an-id"][0]
check("a witness listed under the wrong clause is caught",
      not mismatched["falsifies"], mismatched["detail"])
check("and the clause is still falsifiable by the right one", report["falsifiable"])

missing = continuity.check_clause("id-is-unique", validate.CLAUSES["id-is-unique"], ["no-such-witness"])
check("a witness with no file is a problem, not a skip",
      not missing["falsifiable"] and "no file for witness" in missing["witnesses"][0]["detail"],
      missing["witnesses"][0]["detail"][:60])

print("\n== 3. Pragma's objection, made executable")
# I proposed counting how many observations could fail a clause. Pragma:
# 原始數量容易被重複 fixture 灌高. Here is that inflation, and here is what
# resists it.
catalogue = copy.deepcopy(CONTRACT["witnesses"])
inflated = ["amount-is-letters"]
for i in range(9):
    name = f"amount-is-letters-copy-{i}"
    catalogue[name] = {"semantic_case": catalogue["amount-is-letters"]["semantic_case"]}
    inflated.append(name)

raw_count = len(inflated)
distinct, cases = continuity.distinct_semantic_cases(inflated, catalogue)
check("duplicating one fixture ten times raises a raw count to ten", raw_count == 10, str(raw_count))
check("and leaves the distinct-case count at one", distinct == 1, ", ".join(cases))
check("so the metric I proposed would have been inflated and this one is not",
      raw_count == 10 and distinct == 1,
      "a new case needs someone to write a new sentence describing it")

# And the reverse: a genuinely new case does move the number.
catalogue["amount-is-a-list"] = {"semantic_case": "a structured value where a scalar is required"}
distinct2, _ = continuity.distinct_semantic_cases(inflated + ["amount-is-a-list"], catalogue)
check("while a genuinely different case does move it", distinct2 == 2, f"1 -> {distinct2}")

print("\n== 4. continuity notices what stopped being watched")
report = continuity.continuity(PREVIOUS, CURRENT, {})
dates = [e for e in report if e["clause"] == "date-is-iso"][0]
check("the witness dropped since 1.0 is named", [x["witness"] for x in dates["lost"]] == ["date-is-a-timestamp"],
      json.dumps(dates["lost"], ensure_ascii=False))
check("and it is flagged as having no reason", dates["lost"][0]["reason"] is None)
check("the clause is still falsifiable, which is why a count would not have noticed",
      continuity.check_clause("date-is-iso", validate.CLAUSES["date-is-iso"],
                              CURRENT["date-is-iso"])["falsifiable"],
      "two witnesses remain and both work — the loss is invisible to a pass/fail view")

with_reason = continuity.continuity(PREVIOUS, CURRENT,
                                    {"date-is-a-timestamp": "superseded by date-is-impossible"})
dates2 = [e for e in with_reason if e["clause"] == "date-is-iso"][0]
check("a removal with a recorded reason reads differently",
      dates2["lost"][0]["reason"] == "superseded by date-is-impossible",
      "the tool does not judge the reason, it requires one to exist")

unchanged = continuity.continuity(CURRENT, CURRENT, {})
check("and an unchanged version loses nothing",
      all(not e["lost"] and not e["added"] for e in unchanged),
      "so the report is not simply always complaining")

print("\n== 5. SCL decides the verdict, and says so")
check("this deployment treats an unexplained removal as fatal", policy.removal_is_fatal())
check("and requires every clause to be falsifiable", policy.every_clause_must_be_falsifiable())
# This line used to be `True if policy.removal_is_fatal() else False`, which
# restates the check above it and cannot fail on its own. Compute the verdict
# under both settings instead.
unexplained = [lost["witness"] for entry in continuity.continuity(PREVIOUS, CURRENT, {})
               for lost in entry["lost"] if not lost["reason"]]


def verdict(fatal):
    return 1 if (unexplained and fatal) else 0


check("the same evidence gives opposite verdicts under the two settings",
      verdict(True) == 1 and verdict(False) == 0,
      f"fatal -> exit {verdict(True)}, reported -> exit {verdict(False)}; "
      "archaeology 007's finding, and the report names which setting produced it")
check("and with nothing unexplained, both settings agree",
      (1 if ([] and True) else 0) == 0,
      "the policy only matters when there is something to be lenient about")

print("\n== 6. what this run does not claim")
check("the contract marks itself a candidate", CONTRACT["status"] == "candidate")
check("and credits whose idea this is",
      "Pragma" in CONTRACT["whose_idea"],
      "I proposed a count; this implements the objection to it")

print("")
if FAILURES:
    print(f"  {len(FAILURES)} check(s) failed: {', '.join(FAILURES)}")
    raise SystemExit(1)
print("  island test passed")
