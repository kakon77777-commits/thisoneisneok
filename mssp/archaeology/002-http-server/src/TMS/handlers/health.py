"""Answers a liveness probe. Touches nothing.

The whole point of this file is how little it needs. It is 20 lines, it holds no
reference to a connection, and `island-test.py` runs it with nothing else
loaded. Upstream, the same capability is a `do_GET` on a subclass of
`BaseHTTPRequestHandler`, and instantiating one requires a socket, a client
address and a server object — so the smallest possible version of this is the
entire 1,441-line module plus a method.
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from SMS.message import Request, Response  # noqa: E402


class HealthHandler:
    name = "handlers/health"
    method = "GET"

    def matches(self, request: Request) -> bool:
        return request.target == "/health"

    def handle(self, request: Request) -> Response:
        return Response(200, "OK", b"ok", {"Content-Type": "text/plain"})
