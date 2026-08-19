"""The island test.

    python src/island_test.py

Section 3 is the control: a MEASURED zero, which is what stops zero from being
a synonym for "nothing to measure". Section 4 proves the unmeasurable unit's
stated reason by running it, rather than believing the sentence.
"""
import json
import pathlib
import re
import sys

from SCL import policy
from SMS import measure
from TMS.sources import declaration_is_baked_in, declares_openly, never_declares
from TMS.policies import ignore_declared, retry_declared

HERE = pathlib.Path(__file__).parent
CONTRACT = json.loads((HERE / "FMS" / "contract.json").read_text(encoding="utf-8"))
FAILURES = []
RAN = [0]


def check(label, ok, detail=""):
    RAN[0] += 1
    print(f'  {"PASS" if ok else "FAIL"}  {label}{f" - {detail}" if detail else ""}')
    if not ok:
        FAILURES.append(label)


sources, policies, problems = measure.load()
under_retry = {m["source"]: m for m in measure.measure_all(retry_declared, sources)}
under_ignore = {m["source"]: m for m in measure.measure_all(ignore_declared, sources)}

print("\n== 1. every unit is an island, and FMS matches the tree")
check("loading raised no problems", not problems, "; ".join(problems))
for unit, declared in CONTRACT["units"].items():
    directory = HERE.joinpath(*unit.split("/"))
    on_disk = sorted(p.name for p in directory.glob("*.py") if p.name != "__init__.py")
    check(f"{unit}: FMS declares what is on disk", on_disk == sorted(declared),
          f'disk {", ".join(on_disk)} | FMS {", ".join(sorted(declared))}')
    for name in on_disk:
        body = directory.joinpath(name).read_text(encoding="utf-8")
        siblings = [n[:-3] for n in on_disk if n != name]
        check(f"{unit}/{name} reaches no sibling",
              not [s for s in siblings if re.search(rf"\bimport\b.*\b{s}\b", body)])
        check(f"{unit}/{name} reaches no other set",
              not re.search(r"\b(from|import)\s+(SMS|DMS|SCL|FMS)\b", body))

print("\n== 2. a measurement carries its applicability")
for name, m in sorted(under_retry.items()):
    check(f"{name} says whether it was measured", isinstance(m["applicable"], bool))
check("a non-applicable reading carries no value", under_retry["baked-in"]["value"] is None)
check("and carries a reason instead", bool(under_retry["baked-in"]["reason"]))
check("an applicable reading carries a value and no reason",
      under_retry["declares-openly"]["value"] == 3 and under_retry["declares-openly"]["reason"] is None)
check("NOT_APPLICABLE is not a number", not isinstance(measure.NOT_APPLICABLE, (int, float)))

print("\n== 3. the control - a MEASURED zero")
control = under_ignore["declares-openly"]
absent = under_retry["baked-in"]
check("under ignore-declared, declares-openly measures zero", control["value"] == 0)
check("and it WAS measured - both arms ran", control["applicable"] is True)
check("and they agree", control["declared"] == control["suppressed"], f'{control["declared"]}')
check("baked-in also reads as nothing", absent["value"] is None)
check("but it was not measured", absent["applicable"] is False)
check("so a bare 0 cannot separate them, and applicability can",
      control["applicable"] != absent["applicable"] and (control["value"] or 0) == 0)
check("never-declares gives a measured zero too, under both policies",
      under_retry["never-declares"]["value"] == 0 and under_ignore["never-declares"]["value"] == 0)

print("\n== 4. the unmeasurable unit's reason, proved by running it")
with_declaration = measure.run_one(declaration_is_baked_in, 1)
without_declaration = measure.run_one(declaration_is_baked_in, 1, suppress_declaration=True)
check("suppressing the field does not remove the marker record",
      any("marker" in r for r in without_declaration["records"]))
check("so the two arms hold a different number of records than a clean unit's arms do",
      len(with_declaration["records"]) == len(without_declaration["records"])
      and any("marker" in r for r in with_declaration["records"]))
clean_with = measure.run_one(declares_openly, 1)
clean_without = measure.run_one(declares_openly, 1, suppress_declaration=True)
check("a suppressible unit's two arms are record-identical",
      clean_with["records"] == clean_without["records"])
check("and differ only in the declaration field",
      clean_with["incomplete_because"] is not None and clean_without["incomplete_because"] is None)
check("baked-in's declaration survives suppression, which is why there is no second arm",
      any(r.get("marker") for r in without_declaration["records"]))
check("and the unit says so itself, up front",
      declaration_is_baked_in.DECLARATION_IS_SUPPRESSIBLE is False)

print("\n== 5. the total refuses instead of defaulting to zero")
try:
    measure.total_incentive(list(under_retry.values()))
    check("a total across an unmeasured unit is refused", False, "it returned a number")
except ValueError as refused:
    check("a total across an unmeasured unit is refused", True, str(refused))
    check("and the refusal names the unit", "baked-in" in str(refused))
measurable = [m for m in under_retry.values() if m["applicable"]]
check("a total across measured units alone is allowed",
      measure.total_incentive(measurable) == 3, f"{measure.total_incentive(measurable)}")
check("which is a different number from the one a silent skip would print",
      measure.total_incentive(measurable) == 3 and len(measurable) < len(under_retry))

print("\n== 6. SCL can only be contradicted by something that was measured")
check("a measured positive contradicts", policy.contradicts(under_retry["declares-openly"]) is not None)
check("a measured zero does not", policy.contradicts(under_retry["never-declares"]) is None)
check("and a non-applicable reading does not either",
      policy.contradicts(under_retry["baked-in"]) is None)
check("but it must not read as agreement - main names it separately",
      "NOT MEASURED" in (HERE / "main.py").read_text(encoding="utf-8"))
check("the deployment calls an unmeasurable unit fatal", policy.unmeasurable_is_fatal())

print("\n== 7. the guards from 013, 015 and 018 still hold")


def drill_source(name, **attributes):
    module = type(sys)(name)
    module.NAME = name
    module.CAN_FAIL_WITH = ["x"]
    module.HELD = 1
    module.DECLARATION_IS_SUPPRESSIBLE = True
    module.collect = lambda budget=1: {"records": [{"from": name, "id": "d-1"}],
                                       "incomplete_because": None}
    for key, value in attributes.items():
        setattr(module, key, value)
    return module


_, _, mute = measure.load(extra_sources=[drill_source("drill-mute", CAN_FAIL_WITH=[])])
check("DRILL: an empty CAN_FAIL_WITH is refused", any("CAN_FAIL_WITH is empty" in p for p in mute))
_, _, vouch = measure.load(extra_sources=[drill_source("drill-vouch", COMPLETE=True)])
check("DRILL: a source declaring COMPLETE is refused", any("declares COMPLETE" in p for p in vouch))
silent = drill_source("drill-unsaid")
del silent.DECLARATION_IS_SUPPRESSIBLE
_, _, unsaid = measure.load(extra_sources=[silent])
check("DRILL: a source that will not say whether it is suppressible is refused",
      any("does not say whether its declaration can be suppressed" in p for p in unsaid))
secretive = type(sys)("drill_secretive")
secretive.POLICY = "drill-secretive"
secretive.apply = lambda runs, rerun: [{**r, "kept": r["records"]} for r in runs]
_, _, told = measure.load(extra_policies=[secretive])
check("DRILL: a policy that will not say what it does with a declaration is refused",
      any("does not say what it does" in p for p in told))
_, _, nameless = measure.load(extra_policies=[type(sys)("drill_nameless")])
check("DRILL: a policy module with no POLICY is refused by name, not by crashing",
      any("does not declare POLICY" in p for p in nameless))
_, _, honest = measure.load(extra_sources=[drill_source("drill-honest")])
check("and an honest unit raises nothing", not honest)

print("\n== 8. what this still cannot do, asserted so it stays measured")
check("nothing here reads intent",
      not re.search(r"\bintent\b|\bstrategic\b", (HERE / "SMS" / "measure.py").read_text(encoding="utf-8")))
check("the reason for non-applicability is the unit's own word, checked only by the record shape",
      declaration_is_baked_in.DECLARATION_IS_SUPPRESSIBLE is False
      and any(r.get("marker") for r in without_declaration["records"]),
      "a unit could declare itself unsuppressible and be lying; that reads as n/a, not as zero")
check("the counterfactual is still one unit, one policy, one run's data",
      under_retry["declares-openly"]["value"] != under_ignore["declares-openly"]["value"],
      f'{under_retry["declares-openly"]["value"]} under retry, '
      f'{under_ignore["declares-openly"]["value"]} under ignore - same unit, same data')

print()
if FAILURES:
    print(f'  {len(FAILURES)} FAILED: {" | ".join(FAILURES)}')
    sys.exit(1)
print(f"  {RAN[0]} checks passed - {len(sources)} sources, {len(policies)} policies, "
      f"3 kinds of answer")
