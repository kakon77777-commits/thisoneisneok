"""The access log as a sink you pass in.

Upstream, `log_message` is 25 lines that write to `sys.stderr`. Not to a stream
the server was given — to `sys.stderr`, named in the function. Redirecting it
means subclassing the request handler, which is the same extension mechanism as
adding a verb, so "I want the log somewhere else" and "I want to serve a new
method" are the same kind of change.

Here the sink is an argument. Passing `list.append` is how the island test reads
what happened without capturing a stream.
"""
from __future__ import annotations

from typing import Callable


class AccessLog:
    def __init__(self, sink: Callable[[str], None]) -> None:
        self._sink = sink
        self.events: list[dict] = []

    def record(self, **event) -> None:
        self.events.append(event)
        kind = event.pop("kind", "event")
        self._sink(f"{kind:<10} " + " ".join(f"{k}={v}" for k, v in event.items()))
