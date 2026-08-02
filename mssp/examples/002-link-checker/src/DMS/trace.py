"""What the run actually did.

The number this example exists to make visible is the last block: how many
pacing waits each capability incurred. Prose can claim the promotion did not
spread; a count per capability shows it, and `SCL/policy.py` turns the same
number into something that fails a run.
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from SCL import policy  # noqa: E402


class Trace:
    def __init__(self) -> None:
        self.events: list[dict] = []

    def record(self, **event) -> None:
        self.events.append(event)

    def render(self, pacer, checkers) -> str:
        lines = ["  events:"]
        for e in self.events:
            kind = e.pop("kind")
            body = " ".join(f"{k}={v}" for k, v in e.items())
            lines.append(f"    {kind:<10} {body}")

        lines.append("")
        lines.append("  pacing waits by capability:")
        for checker in checkers:
            n = pacer.waits.get(checker.name, 0)
            allowed = "network" if policy.may_use_network(checker.name) else "no network"
            lines.append(f"    {checker.name:<18} {n:>3}   ({allowed})")
        lines.append(f"    {'clock ticks':<18} {pacer.clock:>3}")
        return "\n".join(lines)
