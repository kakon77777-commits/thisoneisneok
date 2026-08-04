"""Bind four handlers, one of which is the upstream failure.

    python src/main.py
"""
from __future__ import annotations

import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from DMS.report import inert, render          # noqa: E402
from SMS.chain import Opener                  # noqa: E402
from TMS.handlers.data import DataHandler     # noqa: E402
from TMS.handlers.file import FileHandler     # noqa: E402


class TypoHandler:
    """The upstream failure, verbatim: one transposition and the handler is inert."""
    name = "handlers/data"

    def data_opne(self, url: str) -> str:      # noqa: N802 - deliberate
        return "never reached"


class WrongSchemeHandler:
    """Binds a protocol that does not exist. Upstream accepts this."""
    name = "handlers/data"

    def htp_open(self, url: str) -> str:
        return "never requested"


def main() -> int:
    root = Path(tempfile.mkdtemp())
    (root / "note.txt").write_text("served from disk\n", encoding="utf-8")

    opener = Opener()
    for handler in (DataHandler(), FileHandler(root=root), TypoHandler(), WrongSchemeHandler()):
        opener.bind(handler)

    print("\n== urllib opener re-cut")
    print(render(opener.bindings))

    print("\n  opening")
    for url in ("data:text/plain,hello", "file:/note.txt", "htp://example.com", "gopher://old"):
        ok, result = opener.open(url)
        print(f"    {url:<26} {'->' if ok else '  '} {result.strip()}")

    dead = inert(opener.bindings)
    print(f"\n  handlers that bound nothing: {', '.join(dead) if dead else 'none'}")

    # Upstream returns None for all four of these. The assertion is that this
    # version can tell the inert one from the working one.
    if not dead:
        print("\n  RE-CUT FAILED: the typo handler bound something, so nothing is being demonstrated")
        return 1
    if "htp" in opener.by_scheme:
        print("\n  RE-CUT FAILED: a nonexistent scheme was bound")
        return 1
    print("  a transposed letter is now a reported outcome rather than a silent one.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
