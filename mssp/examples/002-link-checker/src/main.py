"""Run the checker.

    python src/main.py                  the structure as published
    python src/main.py --without-pacing the evidence for the promotion

The second one is the point. It removes pacing and shows the loop failing to
close, which is what makes "pacing is core" a measured claim and not a taste.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from DMS.trace import Trace                       # noqa: E402
from SCL import policy                            # noqa: E402
from SMS.model import Link                        # noqa: E402
from SMS.pacing import Pacer                      # noqa: E402
from SMS.pipeline import exit_code, run           # noqa: E402
from TMS.checkers.anchor import AnchorChecker     # noqa: E402
from TMS.checkers.http import HttpChecker         # noqa: E402
from TMS.reporters.text import render             # noqa: E402

# Consecutive links to the same host, which is the ordinary shape of a docs page
# and the condition under which pacing has to do something. Spread the same
# links out and pacing never fires — which is how the first version of this
# example demonstrated nothing while printing a tidy report.
PAGES = {
    "index.md": (
        "# Getting started\n\n"
        "See [setup](https://docs.example.com/setup), [config](https://docs.example.com/config) "
        "and [tuning](https://docs.example.com/tuning).\n"
        "Jump to [#getting-started](#getting-started) or [#missing](#missing).\n"
    ),
    "guide.md": (
        "# Guide\n\n## Deep dive\n\n"
        "More at [v1](https://api.example.com/v1) and [v2](https://api.example.com/v2).\n"
        "Back to [#deep-dive](#deep-dive).\n"
    ),
}


def extract(page: str, body: str) -> list[Link]:
    return [Link(page=page, target=t) for t in re.findall(r"\]\(([^)]+)\)", body)]


def make_transport(clock, *, min_gap: int = 2):
    """A host that refuses when contacted again too soon.

    It does not know whether pacing exists; it reads the same clock everything
    else reads and answers on the gap it observes. An earlier version took a
    `paced` flag, so the two runs differed because they were told to.
    """
    last: dict[str, int] = {}

    def transport(url: str) -> int:
        host = url.split("://", 1)[-1].split("/", 1)[0]
        now = clock()
        previous, last[host] = last.get(host), now
        if previous is not None and now - previous < min_gap:
            return 429      # refused: no usable verdict for this link
        return 200 if "/v2" not in url else 404

    return transport


def main(argv: list[str]) -> int:
    without_pacing = "--without-pacing" in argv

    class NoPacer(Pacer):
        """What "this project has no pacing" looks like from every other module."""
        def pace(self, host, *, on_behalf_of):
            return 0

    trace = Trace()
    pacer: Pacer = NoPacer() if without_pacing else Pacer()
    checkers = [
        HttpChecker(transport=make_transport(lambda: pacer.clock)),
        AnchorChecker(pages=PAGES),
    ]

    report = run(PAGES, checkers, pacer=pacer, extract=extract, on_event=trace.record)

    # A refusal leaves the link with no usable answer, so it counts as unchecked
    # rather than as a link that is broken. That distinction is what
    # `Report.closed` — and therefore the identity test — turns on.
    for verdict in [v for v in report.verdicts if "429" in v.detail]:
        report.verdicts.remove(verdict)
        report.unchecked.append(verdict.link)

    print(f"\n== link-checker {'WITHOUT pacing' if without_pacing else ''}".rstrip())
    print(render(report))
    print()
    print(trace.render(pacer, checkers))

    if without_pacing:
        if report.closed:
            print("\n  pacing removed and the loop still closed — the promotion is NOT justified.")
            return 1
        print("\n  pacing removed: the loop did not close, so pacing is not optional.")
        return 0

    policy.assert_pacing_is_earned(pacer.waits)     # SCL rule the first promotion broke
    print("\n  SCL rule 'pace-requires-network' holds: no network-free capability waited.")

    # This program's exit code reports whether the *structure* held. Two links in
    # the fixture are broken on purpose, so what a real link checker would return
    # is printed rather than exited with.
    problems = []
    if not report.closed:
        problems.append("the loop did not close with pacing present")
    if not pacer.waits.get("checkers/http"):
        problems.append("pacing never fired, so this run demonstrates nothing about it")

    print(f"  a real run would exit {exit_code(report)} (2 fixture links are broken on purpose)")
    if problems:
        print("\n  STRUCTURE FAILED: " + "; ".join(problems))
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
