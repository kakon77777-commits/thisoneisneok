"""Checks an absolute URL by asking an injected transport.

This is the capability that caused the promotion, and it is the one that pays
for it. It calls `pace()` itself, immediately before contacting the host,
because it is the module that knows a connection is about to open.

The transport is injected rather than imported so the example runs offline and
deterministically. A real one would go here and nothing else would change.
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from SMS.model import Link, Verdict  # noqa: E402
from SMS.pacing import Pacer         # noqa: E402

name = "checkers/http"


class HttpChecker:
    name = name

    def __init__(self, transport) -> None:
        self._transport = transport

    def handles(self, link: Link) -> bool:
        return link.host is not None

    def check(self, link: Link, pacer: Pacer) -> Verdict:
        waited = pacer.pace(link.host, on_behalf_of=self.name)
        status = self._transport(link.target)
        detail = f"HTTP {status}" + (f", paced {waited}" if waited else "")
        return Verdict(link=link, ok=200 <= status < 400, detail=detail, checked_by=self.name)
