"""Renders a report for a terminal.

Reads only SMS types. It never asks which checker produced a verdict in order to
format it differently, which is what keeps adding a checker from being a change
here as well.
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from SMS.model import Report  # noqa: E402

name = "reporters/text"


def render(report: Report) -> str:
    lines = []
    for v in report.verdicts:
        mark = "ok  " if v.ok else "FAIL"
        lines.append(f"  {mark} {v.link.page} -> {v.link.target}  ({v.detail})")
    for link in report.unchecked:
        lines.append(f"  ????  {link.page} -> {link.target}  (no verdict)")

    failed = sum(1 for v in report.verdicts if not v.ok)
    lines.append("")
    lines.append(
        f"  {len(report.verdicts)} checked, {failed} failed, "
        f"{len(report.unchecked)} left without a verdict"
    )
    lines.append(f"  loop closed: {report.closed}")
    return "\n".join(lines)
