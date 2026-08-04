"""The island test for the router itself, plus four ways to break it.

    python src/island-test.py

Section 1 is the one that matters and it is unusual: it exercises the router
with **zero TMS modules importable at all** — the package directory is hidden
from the interpreter for the duration. A router that returned modules could not
survive that line. A router that returns names does not notice.

Sections 3-5 exist because of 改良點 6: every claim here rests on the router
refusing things, and a refusal nobody has watched is not a refusal.
"""
from __future__ import annotations

import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from SCL.policy import may_use                   # noqa: E402
from SMS.model import Request                    # noqa: E402
from SMS.router import Router, Rule              # noqa: E402

failures: list[str] = []


def report(label: str, ok: bool, detail: str = "") -> None:
    print(f"  {'PASS' if ok else 'FAIL'}  {label}" + (f" - {detail}" if detail else ""))
    if not ok:
        failures.append(label)


print("\n== 1. the router, with no capability present at all")
{
}
# Nothing under TMS/ has been imported, and for this section nothing can be.
_tms = HERE / "TMS"
_hidden = HERE / "_TMS_hidden_for_the_island_test"
_tms.rename(_hidden)
try:
    rules = [
        Rule("md", "handlers/markdown", when=lambda r: r.kind == "markdown"),
        Rule("csv", "handlers/csv", when=lambda r: r.kind == "csv"),
        Rule("ghost", "handlers/does-not-exist", when=lambda r: r.kind == "ghost"),
    ]
    router = Router(rules)

    decided = router.route(Request(kind="markdown", intent="summarise", actor="app/editor"))
    report("routes with the TMS directory removed from disk", decided.capability == "handlers/markdown",
           f"chose {decided.capability!r}")

    ghost = router.route(Request(kind="ghost", intent="anything", actor="app/editor"))
    report("names a capability that has no file and never will",
           ghost.capability is None or ghost.rule == "ghost",
           f"rule={ghost.rule!r} why={ghost.why!r}")

    imported = [m for m in sys.modules if m.startswith("TMS")]
    report("no TMS module was imported by routing", imported == [], f"imported: {imported}")
finally:
    _hidden.rename(_tms)

print("\n== 2. a refusal is a decision, not a fall-through")
{
}
# app/importer is permitted handlers/csv and nothing else. The specific rule
# names markdown, which it may not use; the catch-all names csv, which it may.
# So a fall-through would hand it a capability by way of being denied a better
# match — which is the shape this section exists to forbid.
router = Router([
    Rule("specific", "handlers/markdown", when=lambda r: r.kind == "markdown"),
    Rule("catch-all", "handlers/csv", when=lambda r: True),
])
denied = router.route(Request(kind="markdown", intent="summarise", actor="app/importer"))
report("a denied match does not fall through to a later rule",
       denied.capability is None and denied.rule == "specific",
       f"capability={denied.capability!r} rule={denied.rule!r}")
report("and the refusal says which permission was missing",
       "not permitted" in denied.why, f'why="{denied.why}"')
report("the caller it WAS permitted stays reachable by its own request",
       Router([Rule("catch-all", "handlers/csv", when=lambda r: True)])
       .route(Request(kind="csv", intent="validate", actor="app/importer")).capability == "handlers/csv",
       "otherwise this section would pass by refusing everything")

print("\n== 3. coverage reports what the rule set did not reach")
{
}
router = Router([
    Rule("used", "handlers/markdown", when=lambda r: r.kind == "markdown"),
    Rule("unused", "handlers/csv", when=lambda r: r.kind == "csv"),
])
router.route(Request(kind="markdown", intent="summarise", actor="app/editor"))
router.route(Request(kind="pdf", intent="extract", actor="app/editor"))
c = router.coverage()
report("a rule that never fired is named", c["never_fired"] == ["unused"], str(c["never_fired"]))
report("a request nothing matched is named", c["unmatched"] == ["pdf/extract"], str(c["unmatched"]))

# and the inverse, or the warning is decoration
full = Router([Rule("used", "handlers/markdown", when=lambda r: True)])
full.route(Request(kind="markdown", intent="summarise", actor="app/editor"))
report("and both go quiet when the rule set covers everything",
       full.coverage()["never_fired"] == [] and full.coverage()["unmatched"] == [])

print("\n== 4. SCL is consulted before a Route exists, not after")
{
}
ok_editor, _ = may_use("app/editor", "handlers/markdown")
ok_anon, why_anon = may_use("anonymous", "handlers/markdown")
report("policy itself distinguishes the two actors", ok_editor and not ok_anon, why_anon)

unknown_ok, why_unknown = may_use("app/nobody", "handlers/markdown")
report("an unknown actor is refused rather than defaulted", not unknown_ok, why_unknown)

routed = Router([Rule("md", "handlers/markdown", when=lambda r: True)]).route(
    Request(kind="markdown", intent="summarise", actor="app/nobody"))
report("and the router never returns a capability the actor may not use",
       routed.capability is None, f"capability={routed.capability!r}")

print("\n== 5. the router holds no reference to anything it names")
{
}
source = (HERE / "SMS" / "router.py").read_text(encoding="utf-8")
# Import lines only. The first version of this check grepped the whole file for
# "TMS" and failed on the docstring sentence saying it imports nothing from TMS
# — a check reading its own documentation and reporting on that.
import_lines = [ln.strip() for ln in source.splitlines()
                if ln.strip().startswith(("import ", "from "))]
report("router.py imports nothing from TMS",
       not any("TMS" in ln for ln in import_lines),
       f"{len(import_lines)} import line(s): {', '.join(import_lines)}")
report("router.py does not import importlib either",
       not any("importlib" in ln for ln in import_lines),
       "resolution belongs to the caller")

print("")
if failures:
    print(f"  {len(failures)} check(s) failed: {', '.join(failures)}")
    raise SystemExit(1)
print("  island test passed")
