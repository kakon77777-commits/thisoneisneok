"""The island test, plus a check that the SCL rule can fail.

    python src/island-test.py

Four things, in the order they are worth doing:

1. Each TMS runs alone, with the minimal core and no sibling loaded.
2. No TMS imports a sibling TMS (grep, not eyeballs).
3. The promotion changed what "minimal core" means, and this says by how much.
4. The wrong shape is built on purpose and the SCL rule is required to reject it.

Point 4 is the one that matters. `assert_pacing_is_earned` passes every ordinary
run, so on its own it is indistinguishable from a function that returns None.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from SCL import policy                          # noqa: E402
from SCL.policy import PermissionError_         # noqa: E402
from SMS.model import Link                      # noqa: E402
from SMS.pacing import Pacer                    # noqa: E402
from SMS.pipeline import run                    # noqa: E402

PAGES = {
    "solo.md": (
        "# Solo\n\n## Second heading\n\n"
        "[a](https://one.example.com/a) [b](https://one.example.com/b)\n"
        "[here](#second-heading) [gone](#nowhere)\n"
    )
}


def extract(page: str, body: str) -> list[Link]:
    return [Link(page=page, target=t) for t in re.findall(r"\]\(([^)]+)\)", body)]


failures: list[str] = []


def report(label: str, ok: bool, detail: str = "") -> None:
    print(f"  {'PASS' if ok else 'FAIL'}  {label}" + (f" - {detail}" if detail else ""))
    if not ok:
        failures.append(label)


print("\n== 1. each TMS alone, minimal core, no sibling loaded")

# --- anchor alone ------------------------------------------------------------
from TMS.checkers.anchor import AnchorChecker    # noqa: E402

pacer = Pacer()
anchor_only = run(PAGES, [AnchorChecker(pages=PAGES)], pacer=pacer, extract=extract)
handled = [v for v in anchor_only.verdicts]
report("checkers/anchor runs with no other checker loaded", len(handled) == 2,
       f"{len(handled)} verdict(s), {len(anchor_only.unchecked)} link(s) left to the absent http checker")
report("checkers/anchor incurred no pacing wait", pacer.waits.get("checkers/anchor", 0) == 0,
       f"waits={pacer.waits.get('checkers/anchor', 0)}")
report("the loop reports the links it could not cover", not anchor_only.closed,
       "unchecked links are recorded rather than silently dropped")

# --- http alone --------------------------------------------------------------
from TMS.checkers.http import HttpChecker        # noqa: E402

pacer = Pacer()


def stub(url: str) -> int:
    return 200


http_only = run(PAGES, [HttpChecker(transport=stub)], pacer=pacer, extract=extract)
report("checkers/http runs with no other checker loaded", len(http_only.verdicts) == 2,
       f"{len(http_only.verdicts)} verdict(s)")
report("checkers/http paced itself", pacer.waits.get("checkers/http", 0) > 0,
       f"waits={pacer.waits.get('checkers/http', 0)}")

print("\n== 2. no TMS imports a sibling TMS")
tms_root = HERE / "TMS"
units = sorted(p for p in tms_root.rglob("*.py"))
violations = []
for path in units:
    text = path.read_text(encoding="utf-8")
    for other in units:
        if other == path:
            continue
        module = other.relative_to(tms_root).with_suffix("").as_posix().replace("/", ".")
        if re.search(rf"\bfrom\s+TMS\.{re.escape(module)}\b|\bimport\s+TMS\.{re.escape(module)}\b", text):
            violations.append(f"{path.name} imports {module}")
report("no sibling TMS import", not violations, "; ".join(violations) or f"{len(units)} unit(s) scanned")

print("\n== 3. what the promotion did to 'minimal core'")
core = sorted(p.name for p in (HERE / "SMS").glob("*.py"))
report("pacing is part of the minimal core now", "pacing.py" in core,
       f"SMS = {', '.join(core)} - before 2026-08-02 this was model.py, pipeline.py")

print("\n== 4. the SCL rule can fail")
# The tidy-looking shape: pace once per link in the pipeline, before dispatch.
# It reads better and it charges the wait to whichever capability is next.
pacer = Pacer()
charged_wrongly = {"checkers/anchor": 1}
try:
    policy.assert_pacing_is_earned(charged_wrongly)
    report("SCL rejects a network-free capability that waited", False,
           "it accepted checkers/anchor waiting, so the rule is decoration")
except PermissionError_ as exc:
    report("SCL rejects a network-free capability that waited", True, str(exc)[:78])

# and it must still accept the real shape
try:
    policy.assert_pacing_is_earned({"checkers/http": 3, "checkers/anchor": 0})
    report("SCL accepts the published shape", True)
except PermissionError_ as exc:
    report("SCL accepts the published shape", False, str(exc))

print()
if failures:
    print(f"  {len(failures)} check(s) failed: {', '.join(failures)}")
    raise SystemExit(1)
print("  island test passed")
