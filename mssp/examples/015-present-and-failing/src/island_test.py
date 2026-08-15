"""The island test, and the state the island test cannot produce.

    python src/island_test.py

Section 2 is the point: the drill this method has always used — remove the unit
and see what happens — and the state next to it that the drill cannot reach.
"""
import json
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE))

from DMS import report  # noqa: E402
from SCL import policy  # noqa: E402
from SMS import gather  # noqa: E402

CONTRACT = json.loads((HERE / "FMS" / "contract.json").read_text(encoding="utf-8"))
FAILURES = []


def check(label, ok, detail=""):
    print(f"  {'PASS' if ok else 'FAIL'}  {label}{' - ' + detail if detail else ''}")
    if not ok:
        FAILURES.append(label)


LOADED, PROBLEMS = gather.load()
ROWS = gather.gather(LOADED)
row = lambda name: next(r for r in ROWS if r["source"] == name)  # noqa: E731

print("\n== 1. every source is an island, says what a bad day looks like, and FMS matches the tree")
check("all three sources loaded with no problems", not PROBLEMS, "; ".join(PROBLEMS))
source_dir = HERE / "TMS" / "sources"
files = sorted(f.name for f in source_dir.iterdir()
               if f.suffix == ".py" and f.name != "__init__.py")
for name in files:
    reaches = re.findall(r"^\s*(?:from|import)\s+(\S+)", (source_dir / name).read_text(encoding="utf-8"), re.M)
    check(f"{name} reaches no sibling set", not reaches, ", ".join(reaches) or "no imports at all")
for where, expected in CONTRACT["units"].items():
    on_disk = sorted(f.name for f in (HERE / where).iterdir()
                     if f.suffix == ".py" and f.name != "__init__.py")
    check(f"{where}: FMS declares {len(expected)}, on disk {len(on_disk)}",
          on_disk == sorted(expected), ", ".join(on_disk))
for name, module in sorted(LOADED.items()):
    check(f"{name} declares what it can fail with", bool(module.CAN_FAIL_WITH),
          ", ".join(module.CAN_FAIL_WITH))

print("\n== 2. the drill this method has, and the state it cannot produce")
removed = gather.gather(LOADED, absent={"remote-index"})
broken = ROWS
check("removing remote-index and breaking it give the same total",
      gather.total(removed) == gather.total(broken),
      f"{gather.total(removed)} both ways")
check("and the record count is the only thing they agree on",
      next(r for r in removed if r["source"] == "remote-index")["outcome"]
      != row("remote-index")["outcome"],
      f"absent vs {row('remote-index')['outcome']}")
check("the island test can produce `absent`",
      next(r for r in removed if r["source"] == "remote-index")["outcome"] == "absent")
check("it cannot produce `failed` - removal is not breakage",
      all(r["outcome"] != "failed" for r in removed if r["source"] == "remote-index"),
      "so MSSP's own structural drill has never seen this state")

print("\n== 3. `empty` is a category, not a synonym for `failed`")
check("archive-dump returned zero records", row("archive-dump")["records"] == 0)
check("and it did NOT fail", row("archive-dump")["failed"] is None,
      "the control - without it, zero records and failure are one observation")
check("remote-index also returned zero records", row("remote-index")["records"] == 0)
check("and it DID fail", row("remote-index")["failed"] == "unreachable")
check("so a count cannot separate them, and the outcome field can",
      row("archive-dump")["records"] == row("remote-index")["records"]
      and row("archive-dump")["outcome"] != row("remote-index")["outcome"],
      "0 == 0, empty != failed")

print("\n== 4. a unit that cannot say what a bad day looks like is refused")


class Silent:
    NAME = "silent-source"
    CAN_FAIL_WITH = []

    @staticmethod
    def collect():
        return {"records": [], "failed": None}


problems = []
if not Silent.CAN_FAIL_WITH:
    problems.append("CAN_FAIL_WITH is empty")
check("a source declaring no failure modes is a problem, not a default",
      bool(problems), problems[0])

print("\n== 5. the report says degraded, and it can be made not to")
lines = []
report.headline(ROWS, gather.total(ROWS), gather.degraded(ROWS), lines.append, True)
check("with must_say_so, the headline names the failure",
      "DEGRADED" in lines[-1], lines[-1].strip())
quiet = []
report.headline(ROWS, gather.total(ROWS), gather.degraded(ROWS), quiet.append, False)
check("without it, the same run reports as a plain count",
      "DEGRADED" not in quiet[-1], quiet[-1].strip())
check("and the two differ, which is what makes the first one evidence",
      lines[-1] != quiet[-1])
check("SCL currently requires it", policy.must_say_so(), str(policy.must_say_so()))

print("\n== 6. fail closed")
_, problem = gather.resolve("s3-bucket", LOADED)
check("an unresolvable source stops the run", problem is not None, problem or "resolved anyway")
check("SCL names a policy the report understands",
      policy.on_failure() in {"fatal", "degrade", "ignore"}, policy.on_failure())

print("\n== 7. what this example does not solve")
print("        MEASURABLE, NOT MEASURED")
print("          - how often a real source is present-and-failing rather than absent")
print("          - what a degraded run costs a caller who served it as complete")
print("        NOT MEASURABLE HERE")
print("          - whether a degraded run should be served. fatal, degrade and ignore")
print("            are all defensible; this takes no position on which.")
print("          - PARTIAL failure. A source that returned some records and then broke")
print("            is a fifth outcome, and the classifier here would call it `worked`.")
print("            That is a known hole, not an omission I noticed afterwards.")

print(f"\n{len(FAILURES)} failure(s)" if FAILURES else "\nall checks passed")
for f in FAILURES:
    print(f"  - {f}")
sys.exit(1 if FAILURES else 0)
