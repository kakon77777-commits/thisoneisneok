"""The island test, the upstream measurement, and four ways to defeat the repair.

    python src/island-test.py
"""
from __future__ import annotations

import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from DMS.report import inert                  # noqa: E402
from SCL.policy import may_serve              # noqa: E402
from SMS.chain import Opener                  # noqa: E402

failures: list[str] = []


def report(label: str, ok: bool, detail: str = "") -> None:
    print(f"  {'PASS' if ok else 'FAIL'}  {label}" + (f" - {detail}" if detail else ""))
    if not ok:
        failures.append(label)


print("\n== 1. each handler alone, no sibling loaded")
from TMS.handlers.data import DataHandler     # noqa: E402

opener = Opener()
b = opener.bind(DataHandler())
ok, out = opener.open("data:text/plain,alone")
report("handlers/data binds and serves with no sibling present", b.schemes == ["data"] and ok and out == "alone",
       f"schemes={b.schemes} out={out!r}")
report("and nothing else is reachable", opener.open("file:/x")[0] is False)

from TMS.handlers.file import FileHandler     # noqa: E402

root = Path(tempfile.mkdtemp())
(root / "a.txt").write_text("only me\n", encoding="utf-8")
solo = Opener()
b2 = solo.bind(FileHandler(root=root))
report("handlers/file binds and serves with no sibling present",
       b2.schemes == ["file"] and solo.open("file:/a.txt")[1].strip() == "only me")

print("\n== 2. the upstream behaviour, measured now")
import urllib.request as ur                   # noqa: E402


class _Good(ur.BaseHandler):
    def data_open(self, req): return None


class _Typo(ur.BaseHandler):
    def data_opne(self, req): return None


class _Wrong(ur.BaseHandler):
    def htp_open(self, req): return None


measured = {}
for label, cls in (("good", _Good), ("typo", _Typo), ("wrong-scheme", _Wrong)):
    d = ur.OpenerDirector()
    returned = d.add_handler(cls())
    measured[label] = {"schemes": sorted(d.handle_open), "handlers": len(d.handlers), "returned": returned}
    print(f"     {label:<13} schemes={measured[label]['schemes']}  handlers={measured[label]['handlers']}  add_handler returned {returned!r}")

report("a correct method binds", measured["good"]["schemes"] == ["data"])
report("a transposed method binds nothing", measured["typo"]["schemes"] == [] and measured["typo"]["handlers"] == 0)
report("and add_handler reports nothing about it", measured["typo"]["returned"] is None,
       "same return value as the successful case")
report("a nonexistent scheme is accepted", measured["wrong-scheme"]["schemes"] == ["htp"],
       "there is no set of real schemes for the name to be checked against")
report("upstream's core is small, which is the part worth keeping",
       len([m for m in ur.OpenerDirector.__dict__ if not m.startswith("__")]) <= 8
       and len([m for m in ur.BaseHandler.__dict__ if not m.startswith("__")]) <= 4,
       f"OpenerDirector={len([m for m in ur.OpenerDirector.__dict__ if not m.startswith('__')])} "
       f"BaseHandler={len([m for m in ur.BaseHandler.__dict__ if not m.startswith('__')])}")

print("\n== 3. the repair catches what upstream cannot")
class Typo:
    name = "handlers/data"
    def data_opne(self, url): return "x"      # noqa: N802


class Wrong:
    name = "handlers/data"
    def htp_open(self, url): return "x"


o = Opener()
bt = o.bind(Typo())
bw = o.bind(Wrong())
report("the transposed handler is reported as binding nothing", not bt.bound_anything)
report("and the near-miss method is named", bt.ignored == ["data_opne"], str(bt.ignored))
report("the nonexistent scheme is refused, not bound", not bw.bound_anything and "htp" not in o.by_scheme,
       f"refused={bw.refused}")
report("inert handlers are listed", sorted(set(inert(o.bindings))) == ["handlers/data"])

print("\n== 4. and it stays quiet when there is nothing to say")
good = Opener()
gb = good.bind(DataHandler())
report("a correct handler produces no near-miss and no refusal",
       gb.bound_anything and gb.ignored == [] and gb.refused == [],
       "otherwise the warnings are decoration that is always present")
report("and nothing is listed as inert", inert(good.bindings) == [])

print("\n== 5. SCL decides what a name is allowed to mean")
ok_data, _ = may_serve("handlers/data", "data")
ok_htp, why_htp = may_serve("handlers/data", "htp")
ok_cross, why_cross = may_serve("handlers/file", "data")
report("a permitted scheme passes", ok_data)
report("an unknown scheme is refused with the real set", not ok_htp and "data" in why_htp, why_htp)
report("a handler cannot claim another's scheme", not ok_cross, why_cross)

print("")
if failures:
    print(f"  {len(failures)} check(s) failed: {', '.join(failures)}")
    raise SystemExit(1)
print("  island test passed")
