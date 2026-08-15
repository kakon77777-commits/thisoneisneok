"""The island test.

    python src/island_test.py

Section 2 is the finding: a partial traversal and a complete one are the same
value, and the only thing that differs is whether anyone was told.
"""
import json
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE))

from SCL import policy  # noqa: E402
from SMS import upstream, walks  # noqa: E402
from TMS.modes import reporting as reporting_mode  # noqa: E402

ARCH = json.loads((HERE / "FMS" / "architecture.json").read_text(encoding="utf-8"))
FAILURES = []


def check(label, ok, detail=""):
    print(f"  {'PASS' if ok else 'FAIL'}  {label}{' - ' + detail if detail else ''}")
    if not ok:
        FAILURES.append(label)


LOADED, PROBLEMS = walks.load()

print("\n== 1. every mode is an island, declares whether anyone is told, and FMS matches the tree")
check("both modes loaded with no problems", not PROBLEMS, "; ".join(PROBLEMS))
mode_dir = HERE / "TMS" / "modes"
for name in sorted(f.name for f in mode_dir.iterdir()
                   if f.suffix == ".py" and f.name != "__init__.py"):
    reaches = re.findall(r"^\s*(?:from|import)\s+(\S+)", (mode_dir / name).read_text(encoding="utf-8"), re.M)
    check(f"{name} imports nothing", not reaches, ", ".join(reaches) or "no imports at all")
for where, expected in ARCH["units"].items():
    on_disk = sorted(f.name for f in (HERE / where).iterdir()
                     if f.suffix == ".py" and f.name != "__init__.py")
    check(f"{where}: FMS declares {len(expected)}, on disk {len(on_disk)}",
          on_disk == sorted(expected), ", ".join(on_disk))
check("exactly one mode reports errors",
      sum(1 for m in LOADED.values() if m.REPORTS_ERRORS) == 1,
      ", ".join(f"{m.NAME}={m.REPORTS_ERRORS}" for m in sorted(LOADED.values(), key=lambda m: m.NAME)))

print("\n== 2. a partial traversal and a complete one are the same value")
silent = upstream.vanishing_subdirectory()
loud = upstream.vanishing_subdirectory(onerror=reporting_mode.make_collector)
check("the same files come back either way", silent["files"] == loud["files"],
      str(silent["files"]))
check("neither run raised", silent["raised"] is None and loud["raised"] is None)
check("the silent run reports nothing", silent["errors"] == [], str(silent["errors"]))
check("the reporting run names the directory that vanished",
      len(loud["errors"]) == 1 and "FileNotFoundError" in loud["errors"][0],
      loud["errors"][0])
check("so the only difference is whether anybody was told",
      silent["files"] == loud["files"] and bool(loud["errors"]) != bool(silent["errors"]))

print("\n== 3. the discriminator exists and the idiomatic loop destroys it")
measured = upstream.empty_versus_missing()
check("an empty directory and a missing one yield different row counts",
      measured["empty"]["rows"] != measured["missing"]["rows"],
      f"{measured['empty']['rows']} vs {measured['missing']['rows']}")
check("and the same number of files - which is what the usual loop collects",
      measured["empty"]["files"] == measured["missing"]["files"],
      f"{measured['empty']['files']} both")
check("neither raised", measured["raised"] is None,
      "os.walk on a path that does not exist is not an error, it is an empty walk")

print("\n== 3b. the drill: a mode that claims to report and does not")


class Overclaiming:
    NAME = "claims-to-report"
    REPORTS_ERRORS = True
    WHAT_THE_CALLER_SEES = "nothing extra, despite the declaration"

    @staticmethod
    def make_collector(into):
        return None                        # the lie: no callback is installed


probe = upstream.vanishing_subdirectory(onerror=Overclaiming.make_collector)
check("a mode declaring REPORTS_ERRORS=True that reports nothing is caught",
      Overclaiming.REPORTS_ERRORS and probe["errors"] == [],
      "declared it reports, reported nothing")

print("\n== 4. fail closed")
_, problem = walks.resolve("raise-on-anything", LOADED)
check("an unresolvable mode stops the run", problem is not None, problem or "resolved anyway")
check("SCL names a mode that exists", policy.mode() in LOADED, policy.mode())
check("and this deployment picked the one that reports",
      LOADED[policy.mode()].REPORTS_ERRORS, policy.mode())

print("\n== 5. what this entry cannot see")
print("        MEASURABLE, NOT MEASURED")
print("          - how often a real traversal loses a directory to a permission error")
print("          - how many callers pass onerror at all")
print("        NOT MEASURABLE HERE")
print("          - whether the default is wrong. A walk that raised on every")
print("            unreadable directory would be unusable on a real filesystem,")
print("            and onerror exists because no default suits everyone.")
print("          - what any caller believed an empty result meant.")

print(f"\n{len(FAILURES)} failure(s)" if FAILURES else "\nall checks passed")
for f in FAILURES:
    print(f"  - {f}")
sys.exit(1 if FAILURES else 0)
