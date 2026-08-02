"""The shapes every other set agrees on.

Nothing here reaches outside itself. A TMS binds to these types, not to another
TMS's idea of them, which is what lets a checker be replaced without any other
module being edited.
"""
from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(frozen=True)
class Link:
    """One link found on one page."""
    page: str
    target: str

    @property
    def host(self) -> str | None:
        """The host to pace against, or None when the link never leaves the page.

        This is the whole reason an in-page fragment and an absolute URL can share
        a pipeline: the link itself says whether contacting anyone is involved.
        """
        if self.target.startswith("#"):
            return None
        rest = self.target.split("://", 1)[-1]
        return rest.split("/", 1)[0] or None


@dataclass(frozen=True)
class Verdict:
    link: Link
    ok: bool
    detail: str
    checked_by: str


@dataclass
class Report:
    verdicts: list[Verdict] = field(default_factory=list)
    unchecked: list[Link] = field(default_factory=list)

    @property
    def closed(self) -> bool:
        """Whether the loop finished its job: every link got a verdict.

        The identity test for pacing turns on this property and not on a
        stopwatch. A run that is merely slow is still a link checker; a run that
        leaves links unchecked is not.
        """
        return not self.unchecked
