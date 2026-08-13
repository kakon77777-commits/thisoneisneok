"""The island test.

    python src/island_test.py

Section 2 is the finding: the field that CAN record an act reports the same
value for the honest commit and the impersonation, because nobody signed.
"""
import json
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE))

from SCL import policy  # noqa: E402
from SMS import fields, upstream  # noqa: E402

ARCH = json.loads((HERE / "FMS" / "architecture.json").read_text(encoding="utf-8"))
FAILURES = []


def check(label, ok, detail=""):
    print(f"  {'PASS' if ok else 'FAIL'}  {label}{' - ' + detail if detail else ''}")
    if not ok:
        FAILURES.append(label)


LOADED, PROBLEMS = fields.load()
DIRECTORY = upstream.build_repository()
ROWS = upstream.commits(DIRECTORY)

print("\n== 1. every field is an island, declares claim or act, and FMS matches the tree")
check("all four fields loaded with no problems", not PROBLEMS, "; ".join(PROBLEMS))
field_dir = HERE / "TMS" / "fields"
files = sorted(f.name for f in field_dir.iterdir() if f.suffix == ".py" and f.name != "__init__.py")
for name in files:
    reaches = re.findall(r"^\s*(?:from|import)\s+(\S+)", (field_dir / name).read_text(encoding="utf-8"), re.M)
    check(f"{name} reaches no sibling set", not reaches, ", ".join(reaches) or "no imports at all")
for where, expected in ARCH["units"].items():
    on_disk = sorted(f.name for f in (HERE / where).iterdir()
                     if f.suffix == ".py" and f.name != "__init__.py")
    check(f"{where}: FMS declares {len(expected)}, on disk {len(on_disk)}",
          on_disk == sorted(expected), ", ".join(on_disk))
check("exactly one field declares itself an act",
      sum(1 for m in LOADED.values() if m.KIND == "act") == 1,
      ", ".join(f"{m.NAME}={m.KIND}" for m in sorted(LOADED.values(), key=lambda m: m.NAME)))

print("\n== 2. the impersonating commit is the same kind of object")
honest, impersonating = ROWS[0], ROWS[1]
check("git reports a different author for it", honest["author"] != impersonating["author"],
      f"{honest['author']} vs {impersonating['author']}")
check("and that is the whole of what git knows - the raw object carries no signature",
      "gpgsig" not in upstream.raw_object(DIRECTORY))
check("the one field that could tell them apart reports the SAME value",
      honest["signature_status"] == impersonating["signature_status"],
      f"%G? = {honest['signature_status']} for both")
check("so a field that CAN be an act is not one until someone performs it",
      LOADED["signature"].KIND == "act"
      and honest["signature_status"] == LOADED["signature"].UNIFORM_WHEN_UNUSED)

print("\n== 3. the trailer is a line of the message")
check("a Co-Authored-By naming someone who never saw the branch is stored verbatim",
      "Someone Who Never Saw This" in upstream.trailer(DIRECTORY), upstream.trailer(DIRECTORY))
check("and it is declared a claim, not an act", LOADED["trailer"].KIND == "claim")

print("\n== 4. fail closed")
_, problem = fields.resolve("gpg-web-of-trust", LOADED)
check("an unresolvable field stops the run", problem is not None, problem or "resolved anyway")
check("SCL names a field that exists", policy.trusted() in LOADED, policy.trusted())
check("and the field it trusts is the one declared an act",
      LOADED[policy.trusted()].KIND == "act", f"{policy.trusted()} = {LOADED[policy.trusted()].KIND}")

print("\n== 5. what this entry cannot see")
print("        MEASURABLE, NOT MEASURED")
print("          - how many commits in a real repository carry a good signature")
print("          - what fraction of Co-Authored-By trailers name someone who was there")
print("        NOT MEASURABLE HERE")
print("          - whether git is wrong to work this way. A distributed VCS has no")
print("            authority to issue identities, and signing exists because the")
print("            author field is not one.")
print("          - whether any commit anywhere is honest. This measures what the")
print("            fields CAN carry, not what they do.")

print(f"\n{len(FAILURES)} failure(s)" if FAILURES else "\nall checks passed")
for f in FAILURES:
    print(f"  - {f}")
sys.exit(1 if FAILURES else 0)
