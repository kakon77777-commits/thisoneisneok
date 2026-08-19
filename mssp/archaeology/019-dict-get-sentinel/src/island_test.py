"""The island test, run against real dicts.

    python src/island_test.py

Section 3 is the control. Section 3b is the drill: a reader that DECLARES it
separates the two situations while calling plain get must be caught.
"""
import json
import pathlib
import re
import sys

from SMS import upstream
from TMS.readers import forgiving, subscript, with_sentinel

HERE = pathlib.Path(__file__).parent
FMS = json.loads((HERE / "FMS" / "architecture.json").read_text(encoding="utf-8"))
POLICY = json.loads((HERE / "SCL" / "policy.json").read_text(encoding="utf-8"))
FAILURES = []
RAN = [0]


def check(label, ok, detail=""):
    RAN[0] += 1
    print(f'  {"PASS" if ok else "FAIL"}  {label}{f" - {detail}" if detail else ""}')
    if not ok:
        FAILURES.append(label)


print(f"\n  {upstream.versions()}")

print("\n== 1. each reader is an island, and FMS matches the tree")
for unit, declared in FMS["units"].items():
    directory = HERE.joinpath(*unit.split("/"))
    on_disk = sorted(p.name for p in directory.glob("*.py") if p.name != "__init__.py")
    check(f"{unit}: FMS declares what is on disk", on_disk == sorted(declared),
          f'disk {", ".join(on_disk)} | FMS {", ".join(sorted(declared))}')
    for name in on_disk:
        body = directory.joinpath(name).read_text(encoding="utf-8")
        check(f"{unit}/{name} imports nothing at all",
              not re.search(r"^\s*(import|from)\s", body, re.M))
check("all three readers declare what they separate",
      all(isinstance(m.SEPARATES_MISSING_FROM_NONE, bool)
          for m in (forgiving, with_sentinel, subscript)))

print("\n== 2. two situations, one value")
on_none = forgiving.read(upstream.PRESENT_NONE, "a")
on_missing = forgiving.read(upstream.MISSING, "a")
check("d.get returns None for a key set to None", on_none["value"] is None)
check("and None for a key that is not there", on_missing["value"] is None)
check("the same value", on_none["value"] == on_missing["value"])
check("the same type", type(on_none["value"]) is type(on_missing["value"]))
check("and the same object", on_none["value"] is on_missing["value"])
check("neither raised", on_none["raised"] is None and on_missing["raised"] is None)

print("\n== 3. the control - a key that is present with a truthy value")
table = upstream.falsy_table()
control = [row for row in table if "control" in row["case"]]
check("the table carries a control", len(control) == 1)
check("and it comes out on the other branch", control[0]["falsy"] is False)
check("while every other case is falsy",
      all(row["falsy"] for row in table if "control" not in row["case"]))
collapsed = upstream.collapsed(table)
present = upstream.of_those_present(table)
check("so 6 situations reach one branch", collapsed == 6, f"{collapsed}")
check("and 5 of those 6 have the key", present == 5, f"{present}")
check("which makes the idiomatic test right about absence once in six",
      collapsed - present == 1)
check("without the control the sentence would be about the test, not the values",
      control[0]["falsy"] != table[0]["falsy"])

print("\n== 3b. DRILL - a reader that overclaims must be caught by running it")


class Liar:
    READER = "drill-liar"
    SEPARATES_MISSING_FROM_NONE = True  # the declaration

    @staticmethod
    def read(mapping, key):  # the implementation, which does not
        return {"value": mapping.get(key), "raised": None}


check("the drill unit declares it separates them", Liar.SEPARATES_MISSING_FROM_NONE is True)
check("running it says otherwise", upstream.separates(Liar) is False)
check("so the declaration is refused", upstream.separates(Liar) != Liar.SEPARATES_MISSING_FROM_NONE)
for module in (forgiving, with_sentinel, subscript):
    check(f"and {module.READER}'s declaration holds under the same probe",
          upstream.separates(module) is module.SEPARATES_MISSING_FROM_NONE)

print("\n== 4. the discriminators that exist")
check("`key in d` separates them",
      ("a" in upstream.PRESENT_NONE) != ("a" in upstream.MISSING))
sent_none = with_sentinel.read(upstream.PRESENT_NONE, "a")
sent_missing = with_sentinel.read(upstream.MISSING, "a")
check("d.get(key, SENTINEL) separates them", sent_none["present"] != sent_missing["present"])
check("and still returns the same value in both", sent_none["value"] == sent_missing["value"],
      "which is why the answer needs two fields, not a better single one")
sub_missing = subscript.read(upstream.MISSING, "a")
check("d[key] raises on the missing one", sub_missing["raised"] is not None, sub_missing["raised"])
check("and returns quietly on the present-None one",
      subscript.read(upstream.PRESENT_NONE, "a")["raised"] is None)
check("so the forgiving and the strict accessor live on the same type",
      forgiving.RAISES_ON_MISSING is False and subscript.RAISES_ON_MISSING is True)
check("the sentinel is not in the signature - the caller has to bring an object()",
      "default" in (dict.get.__doc__ or "") and with_sentinel.MISSING is not None)

print("\n== 5. what this does not change")
check("d.get is right to be forgiving - a default is the common case",
      forgiving.read({"a": 7}, "a")["value"] == 7)
check("and None is a legal value, so it cannot be the missing marker",
      upstream.PRESENT_NONE["a"] is None)
check("which is exactly why the sentinel has to be an object the caller owns",
      with_sentinel.MISSING is not None and with_sentinel.MISSING is not False)
check("SCL names what it cannot reach", "call site" in POLICY["what_this_cannot_reach"])
check("and this deployment does refuse the forgiving reader",
      POLICY["reader"] != forgiving.READER)

print()
if FAILURES:
    print(f'  {len(FAILURES)} FAILED: {" | ".join(FAILURES)}')
    sys.exit(1)
print(f"  {RAN[0]} checks passed - every probe ran real dicts")
