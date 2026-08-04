"""Serves data: URLs. Declares its scheme by method name, as upstream does."""
from __future__ import annotations

import base64

name = "handlers/data"


class DataHandler:
    name = name

    def data_open(self, url: str) -> str:
        _, _, rest = url.partition(":")
        meta, _, payload = rest.partition(",")
        if "base64" in meta:
            return base64.b64decode(payload).decode("utf-8", "replace")
        return payload
