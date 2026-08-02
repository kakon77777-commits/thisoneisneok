"""Requests and responses as values. Nothing here owns a socket.

This is the first thing the re-cut moves. Upstream, `parse_request` is 116 lines
that read from `self.rfile` and call `self.send_error(...)` when the input is
malformed — so parsing a request and answering one are the same operation, and
neither can happen without a connection.

Here `parse` takes bytes and returns either a Request or a Response. A rejection
is a *value* the caller may choose to send. Nothing is written to anyone.
"""
from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(frozen=True)
class Request:
    method: str
    target: str
    version: str
    headers: dict[str, str] = field(default_factory=dict)


@dataclass(frozen=True)
class Response:
    status: int
    reason: str
    body: bytes = b""
    headers: dict[str, str] = field(default_factory=dict)


def parse(raw: bytes) -> Request | Response:
    """bytes -> Request, or the Response explaining why not.

    Returning the rejection instead of sending it is the whole difference. A
    caller with no connection — a test, say — gets the same answer as one with.
    """
    try:
        head, _, _ = raw.partition(b"\r\n\r\n")
        lines = head.decode("iso-8859-1").split("\r\n")
        parts = lines[0].split()
    except Exception:
        return Response(400, "Bad Request", b"unreadable request line")

    if len(parts) != 3:
        return Response(400, "Bad Request", b"malformed request line")

    method, target, version = parts
    if not version.startswith("HTTP/"):
        return Response(400, "Bad Request", b"unrecognised protocol version")

    headers: dict[str, str] = {}
    for line in lines[1:]:
        name, sep, value = line.partition(":")
        if sep:
            headers[name.strip().lower()] = value.strip()

    return Request(method=method, target=target, version=version, headers=headers)


def serialise(response: Response) -> bytes:
    head = f"HTTP/1.1 {response.status} {response.reason}\r\n"
    headers = {"Content-Length": str(len(response.body)), **response.headers}
    head += "".join(f"{k}: {v}\r\n" for k, v in headers.items())
    return head.encode("latin-1") + b"\r\n" + response.body
