"""Checks an in-page `#fragment` against the headings of the page it sits on.

Nothing here leaves the document. SCL gives it `network: false`, and it is the
module that proves the promotion did not spread: it takes a `Pacer` because the
interface says so, and never calls it, so its wait count stays at zero.

If a later change makes this module wait — most likely by moving `pace()` up
into the pipeline where it reads more tidily — `SCL/policy.py` fails the run.
That check exists because the first version of the promotion did exactly that.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from SMS.model import Link, Verdict  # noqa: E402
from SMS.pacing import Pacer         # noqa: E402

name = "checkers/anchor"

_HEADING = re.compile(r"^#{1,6}\s+(.+)$", re.M)


def _slugs(body: str) -> set[str]:
    return {
        re.sub(r"[^a-z0-9]+", "-", h.strip().lower()).strip("-")
        for h in _HEADING.findall(body)
    }


class AnchorChecker:
    name = name

    def __init__(self, pages: dict[str, str]) -> None:
        self._pages = pages

    def handles(self, link: Link) -> bool:
        return link.host is None and link.target.startswith("#")

    def check(self, link: Link, pacer: Pacer) -> Verdict:
        # `pacer` is accepted and deliberately unused: the contract is the same
        # for every checker, and this one has nobody to be polite to.
        del pacer
        wanted = link.target[1:]
        available = _slugs(self._pages.get(link.page, ""))
        ok = wanted in available
        detail = "found" if ok else f"no heading yields #{wanted}"
        return Verdict(link=link, ok=ok, detail=detail, checked_by=self.name)
