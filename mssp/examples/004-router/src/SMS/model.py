"""The shapes routing is decided over.

`Route` is the decision this example turns on. It names a capability; it does
not hold one. That single choice is what makes the router testable alone — a
Route can be produced, inspected and asserted about with none of the capabilities
it names present in the process.
"""
from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(frozen=True)
class Request:
    """What the caller asked for."""
    kind: str                 # the artifact: "markdown", "csv", "image"
    intent: str               # what to do with it: "summarise", "validate"
    actor: str = "anonymous"  # who is asking; SCL reads this
    size_kb: int = 0


@dataclass(frozen=True)
class Route:
    """A decision, as a value.

    `capability` is a name. Nothing here imports, loads, or holds the module it
    refers to. Resolving a name to code is the caller's job, and keeping it the
    caller's job is the whole point.
    """
    capability: str | None
    rule: str | None
    why: str
    evidence: list[str] = field(default_factory=list)

    @property
    def matched(self) -> bool:
        return self.capability is not None
