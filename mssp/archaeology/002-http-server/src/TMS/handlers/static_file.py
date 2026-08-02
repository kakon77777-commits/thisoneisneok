"""Serves a file from a directory.

The confinement it needs — "do not leave the served root" — is asked of SCL
rather than implemented here. Upstream the equivalent lives in
`SimpleHTTPRequestHandler.translate_path`, on the class a subclass extends,
which means a subclass that overrides it takes the confinement with it. The
protection is real but it is held in the same place as the thing it protects
against.
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from SCL.policy import Refused, confine       # noqa: E402
from SMS.message import Request, Response     # noqa: E402

_TYPES = {".html": "text/html", ".css": "text/css", ".json": "application/json", ".txt": "text/plain"}


class StaticFileHandler:
    name = "handlers/static-file"
    method = "GET"

    def __init__(self, root: Path) -> None:
        self._root = root

    def matches(self, request: Request) -> bool:
        # Everything the probe did not claim. Order in the registry decides, and
        # the registry is a list the caller controls.
        return True

    def handle(self, request: Request) -> Response:
        try:
            path = confine(self.name, request.target, self._root)
        except Refused as exc:
            # A refusal is reported as a value, like every other outcome here.
            return Response(403, "Forbidden", str(exc).encode())

        if not path.is_file():
            return Response(404, "Not Found", b"no such file")

        body = path.read_bytes()
        ctype = _TYPES.get(path.suffix, "application/octet-stream")
        return Response(200, "OK", body, {"Content-Type": ctype})
