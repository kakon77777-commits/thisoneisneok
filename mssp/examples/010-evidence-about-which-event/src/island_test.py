"""The island test, and the drill that corrected the claim this example started from.

    python src/island_test.py

Section 3 is the one that matters, and it does not come out the way I expected.
I opened mssp-d-003 with "a check that can only read one value cannot prove
anything that needs two". event-blind-v1 reads one value over this history — and
section 3b shows it is not a constant at all: extend the history by one
unexempted file and it produces two. So the defect was never the arity. It is
that the values it does take are about a different event than the one under
judgement. Section 4 holds the observation byte-identical and moves only which
event it belongs to.
"""
import copy
import json
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE))

from SCL import policy  # noqa: E402
from SMS import guards, review  # noqa: E402

CONTRACT = json.loads((HERE / "FMS" / "contract.json").read_text(encoding="utf-8"))
FAILURES = []


def check(label, ok, detail=""):
    print(f"  {'PASS' if ok else 'FAIL'}  {label}{' - ' + detail if detail else ''}")
    if not ok:
        FAILURES.append(label)


def run(contract, guard_name):
    rows, problems = review.review(contract, guard_name)
    assert not problems, problems
    return rows


print("\n== 1. every exemption is an island, and every one honours the evidence contract")
exemption_dir = HERE / "TMS" / "exemptions"
files = sorted(f for f in exemption_dir.iterdir() if f.suffix == ".py" and f.name != "__init__.py")
check("there are three exemption files", len(files) == 3, ", ".join(f.stem for f in files))
for f in files:
    reaches = re.findall(r"^\s*(?:from|import)\s+(\S+)", f.read_text(encoding="utf-8"), re.M)
    siblings = [r for r in reaches if r.split(".")[0] in {"TMS", "SMS", "SCL", "DMS", "FMS"}]
    check(f"{f.stem} reaches no sibling set", not siblings, ", ".join(reaches) or "no imports at all")

required = CONTRACT["evidence_contract"]["required_fields"]
seen_evidence = [row["evidence"] for row in run(CONTRACT, "event-scoped-v1") if row["evidence"]]
check("every piece of evidence produced carries every required field",
      all(all(field in ev for field in required) for ev in seen_evidence),
      f"{len(seen_evidence)} pieces, fields {', '.join(required)}")
unconditional = [ev for ev in seen_evidence if ev["about"] == "*"]
check("every unconditional exemption names an owner and a sunset",
      all(ev.get("owner") and ev.get("sunset") for ev in unconditional),
      f"{len(unconditional)} unconditional: " + ", ".join(sorted({ev['rule'] for ev in unconditional})))

print("\n== 2. the guard id selects behaviour, it is not just resolved")
# 008 was lost to exactly this: an id that resolved and never reached the thing
# it named. Resolution is proved by disagreement, not by the lookup succeeding.
blind = run(CONTRACT, "event-blind-v1")
scoped = run(CONTRACT, "event-scoped-v1")
differ = [(b["round"], b["path"]) for b, s in zip(blind, scoped) if b["verdict"] != s["verdict"]]
check("the two ids produce different verdicts on the same history", bool(differ),
      f"{len(differ)} of {len(blind)} changes differ")
_, problem = guards.resolve("event-scoped-v2")
check("an id with no implementation stops the run", problem is not None, problem or "resolved anyway")
rows, problems = review.review(CONTRACT, "event-scoped-v2")
check("and nothing is reviewed when it does not resolve", rows is None, f"{len(problems)} problem(s)")

print("\n== 3a. how many verdicts each guard produced over THIS history")
for name in ("event-blind-v1", "event-scoped-v1"):
    values = review.verdict_values(run(CONTRACT, name))
    print(f"        {name:<16} {len(values)} distinct: {', '.join(values)}")
check("event-blind-v1 produced exactly one verdict here",
      review.verdict_values(blind) == ["exempt"], ", ".join(review.verdict_values(blind)))
check("event-scoped-v1 produced two", len(review.verdict_values(scoped)) == 2,
      ", ".join(review.verdict_values(scoped)))

print("\n== 3b. the drill: is that one value a property of the guard, or of the history?")
# If this section cannot come out the other way, section 3a proves nothing about
# the guard. Add one file no exemption covers and see whether blind moves.
extended = copy.deepcopy(CONTRACT)
extended["history"]["rounds"].append({"id": "r6", "date": "2026-08-11", "changes": [
    {"path": "core/unclaimed.py", "kind": "source", "drift": True}]})
blind_extended = review.verdict_values(run(extended, "event-blind-v1"))
check("one unexempted file makes event-blind-v1 produce two verdicts",
      len(blind_extended) == 2, ", ".join(blind_extended))
print("        so the single value in 3a is not an inability to say 'review'.")
print("        event-blind-v1 discriminates. It discriminates on whether evidence")
print("        EXISTS - which is a different event from the one being judged.")

print("\n== 4. the same observation, byte for byte, about two different events")
# Hold everything constant except which round the test change belongs to. If the
# `observed` strings are not identical, this section is comparing two different
# observations and proves nothing.
def parser_drift_in_r2(test_round):
    c = copy.deepcopy(CONTRACT)
    c["history"]["rounds"] = [
        {"id": "r1", "date": "2026-08-01", "changes":
            ([{"path": "tests/test_parser.py", "kind": "test", "drift": False}]
             if test_round == "r1" else [])},
        {"id": "r2", "date": "2026-08-04", "changes":
            [{"path": "core/parser.py", "kind": "source", "drift": True}]
            + ([{"path": "tests/test_parser.py", "kind": "test", "drift": False}]
               if test_round == "r2" else [])},
    ]
    return c

same_round = run(parser_drift_in_r2("r2"), "event-scoped-v1")[0]
earlier = run(parser_drift_in_r2("r1"), "event-scoped-v1")[0]
check("both runs observed the very same thing",
      same_round["evidence"]["observed"] == earlier["evidence"]["observed"],
      repr(same_round["evidence"]["observed"]))
check("and they disagree only about which event it was about",
      same_round["evidence"]["about"] != earlier["evidence"]["about"],
      f"{same_round['evidence']['about']} vs {earlier['evidence']['about']}")
check("event-scoped-v1 gives different verdicts", same_round["verdict"] != earlier["verdict"],
      f"{same_round['verdict']} vs {earlier['verdict']}")
blind_same = run(parser_drift_in_r2("r2"), "event-blind-v1")[0]
blind_earlier = run(parser_drift_in_r2("r1"), "event-blind-v1")[0]
check("event-blind-v1 gives the same verdict to both",
      blind_same["verdict"] == blind_earlier["verdict"],
      f"{blind_same['verdict']} and {blind_earlier['verdict']}")

print("\n== 5. fail closed")
view = {"unconditional_requires": CONTRACT["evidence_contract"]["unconditional_requires"]}
change = {"round": "r2", "date": "2026-08-04", "path": "core/parser.py", "kind": "source"}
for label, evidence, expected in [
    ("evidence with no `about`", {"rule": "x", "observed": "something"}, "malformed-evidence"),
    ("unconditional with no owner",
     {"rule": "x", "about": "*", "observed": "s", "sunset": "2026-12-01"}, "malformed-evidence"),
    ("unconditional past its sunset",
     {"rule": "x", "about": "*", "observed": "s", "owner": "n", "sunset": "2026-07-01"}, "expired-waiver"),
]:
    out = guards.event_scoped_v1(change, evidence, view)
    check(f"{label} -> review", out["verdict"] == "review" and out["code"] == expected, out["code"])

order = list(CONTRACT["exemption_order"]) + ["a-rule-nobody-wrote"]
_, problems = review.load_exemptions(order)
check("an ordered rule with no module is a problem, not a skip", len(problems) == 1,
      problems[0] if problems else "silently skipped")

import TMS.exemptions.owner_waived as ow  # noqa: E402
ow.RULE, restored = "something-else", "owner-waived"
_, problems = review.load_exemptions(CONTRACT["exemption_order"])
ow.RULE = restored
check("a module that disagrees with the id it was reached by is a problem",
      len(problems) == 1, problems[0] if problems else "accepted anyway")

print("\n== 6. what this does not settle")
print("        MEASURABLE, NOT MEASURED")
print("          - how often exemption evidence goes stale in a real repository")
print("          - what requiring `about` costs the people writing exemptions")
print("        NOT MEASURABLE HERE")
print("          - whether an exemption SHOULD be event-scoped. generated-file is")
print("            unconditional because a generated file is generated; owner-waived is")
print("            unconditional because a person said so. The contract knows which is")
print("            which because someone wrote it down, not because anything found out.")
print("          - whether event-scoped-v1 is right. Section 3b is evidence against the")
print("            form of the criterion I opened mssp-d-003 with, not for it.")

print(f"\n{len(FAILURES)} failure(s)" if FAILURES else "\nall checks passed")
for f in FAILURES:
    print(f"  - {f}")
sys.exit(1 if FAILURES else 0)
