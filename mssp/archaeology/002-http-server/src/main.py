"""Run the re-cut against a few raw requests.

    python src/main.py

No socket is opened. Requests are bytes, which is what makes the handlers
testable and what upstream cannot offer without a connection.
"""
from __future__ import annotations

import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from DMS.access_log import AccessLog                     # noqa: E402
from SMS.dispatch import dispatch                        # noqa: E402
from SMS.message import Request, Response, parse, serialise  # noqa: E402
from TMS.handlers.health import HealthHandler            # noqa: E402
from TMS.handlers.static_file import StaticFileHandler   # noqa: E402

REQUESTS = [
    b"GET /health HTTP/1.1\r\nHost: localhost\r\n\r\n",
    b"GET /index.html HTTP/1.1\r\nHost: localhost\r\n\r\n",
    b"GET /../secrets.txt HTTP/1.1\r\nHost: localhost\r\n\r\n",
    b"POST /health HTTP/1.1\r\nHost: localhost\r\n\r\n",
    b"nonsense\r\n\r\n",
]


def main() -> int:
    root = Path(tempfile.mkdtemp()) / "public"
    root.mkdir()
    (root / "index.html").write_text("<h1>served</h1>\n", encoding="utf-8")
    (root.parent / "secrets.txt").write_text("not for you\n", encoding="utf-8")

    log = AccessLog(sink=lambda line: print(f"    {line}"))
    handlers = [HealthHandler(), StaticFileHandler(root=root)]

    print("\n== http-server re-cut (no socket)")
    for raw in REQUESTS:
        first = raw.split(b"\r\n", 1)[0].decode("latin-1")
        print(f"\n  -> {first}")
        parsed = parse(raw)
        # A rejection from the parser is a Response, not something it sent.
        response = parsed if isinstance(parsed, Response) else dispatch(
            parsed, handlers, on_event=log.record
        )
        head = serialise(response).split(b"\r\n", 1)[0].decode("latin-1")
        print(f"    {head}   {len(response.body)} byte(s)")

    print(f"\n  {len(log.events)} event(s) recorded to the sink the caller supplied")

    # The confinement is the one outcome worth asserting rather than eyeballing,
    # and the assertion has to require the refusal rather than merely permit it.
    # Written as "no 200 for a path containing secrets", it passed while the file
    # handler was never reached at all.
    escape = next((e for e in log.events if "secrets" in str(e.get("target", ""))), None)
    problems = []
    if escape is None:
        problems.append("the escape attempt reached no handler, so nothing was tested")
    elif escape.get("handler") != "handlers/static-file":
        problems.append(f"the escape attempt went to {escape.get('handler')}, not the file handler")
    elif escape.get("status") != 403:
        problems.append(f"the escape attempt returned {escape.get('status')}, not 403")

    if problems:
        print("  CONFINEMENT NOT DEMONSTRATED: " + "; ".join(problems))
        return 1
    print("  confinement demonstrated: the file handler refused a path outside its root")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
