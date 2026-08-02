"""The loop: pages in, a verdict per link out.

The pipeline knows the registered checkers by the interface they publish here.
It does not import any of them, and it does not know which ones exist until it
is handed them — which is what makes running one alone possible.

Note what the pipeline does *not* do: it does not call `pace()`. That was the
first shape after the promotion and it is the reason the SCL rule exists. See
`SCL/policy.py::assert_pacing_is_earned`.
"""
from __future__ import annotations

import sys
from pathlib import Path
from typing import Callable, Protocol

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from SCL import policy                       # noqa: E402
from SMS.model import Link, Report, Verdict  # noqa: E402
from SMS.pacing import Pacer                 # noqa: E402


class Checker(Protocol):
    """What a TMS checker must publish. The only contract between core and TMS."""

    name: str

    def handles(self, link: Link) -> bool: ...

    def check(self, link: Link, pacer: Pacer) -> Verdict: ...


def run(
    pages: dict[str, str],
    checkers: list[Checker],
    *,
    pacer: Pacer | None = None,
    extract: Callable[[str, str], list[Link]],
    on_event: Callable[..., None] = lambda **_: None,
) -> Report:
    report = Report()
    pacer = pacer or Pacer()

    for page, body in pages.items():
        for link in extract(page, body):
            pacer.tick()
            checker = next((c for c in checkers if c.handles(link)), None)
            if checker is None:
                # No verdict is a real outcome, not an error to swallow. It is
                # what `Report.closed` reads to decide whether the loop finished.
                report.unchecked.append(link)
                on_event(kind="unchecked", link=link.target, reason="no checker loaded handles it")
                continue

            verdict = checker.check(link, pacer)
            report.verdicts.append(verdict)
            on_event(kind="verdict", link=link.target, ok=verdict.ok,
                     by=verdict.checked_by, detail=verdict.detail)

    return report


def exit_code(report: Report) -> int:
    """Non-zero only where a capability that is allowed to fail the run found a fault."""
    for verdict in report.verdicts:
        if not verdict.ok and policy.may_fail_run(verdict.checked_by):
            return 1
    return 0 if report.closed else 2
