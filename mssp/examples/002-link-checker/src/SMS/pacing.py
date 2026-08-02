"""Waits between requests to the same host.

**This module was TMS until 2026-08-02.** It moved here because of the identity
test, not because moving it silenced a build error — the build error is what
made anyone look, and looking is what found the reason.

    If pacing is removed, is the system still the system it was?

Run `python src/main.py --without-pacing` and read the answer: the transport
starts refusing, links are left with no verdict, and `Report.closed` is False.
The loop does not close. A capability the loop cannot close without is core.

The delay is recorded rather than slept, so a run is instant and the cost is
still visible. What matters structurally is who is charged for it, and that is
answered by `Link.host` being None for a link that never leaves the page — not
by pacing knowing anything about checkers.
"""
from __future__ import annotations


class Pacer:
    def __init__(self, min_gap_ticks: int = 2) -> None:
        self.min_gap = min_gap_ticks
        self.clock = 0
        self._last_seen: dict[str, int] = {}
        self.waits: dict[str, int] = {}

    def tick(self) -> None:
        self.clock += 1

    def pace(self, host: str | None, *, on_behalf_of: str) -> int:
        """Charge whatever wait this host needs to the capability asking for it.

        `host=None` costs nothing and is recorded as nothing. That is the entire
        mechanism keeping the promotion from spreading to modules that do not
        reach the network — and it works because the caller is the capability
        about to open a connection, not the pipeline dispatching to it.
        """
        if host is None:
            return 0

        last = self._last_seen.get(host)
        waited = 0
        if last is not None and self.clock - last < self.min_gap:
            waited = self.min_gap - (self.clock - last)
            self.clock += waited
            self.waits[on_behalf_of] = self.waits.get(on_behalf_of, 0) + 1

        self._last_seen[host] = self.clock
        return waited
