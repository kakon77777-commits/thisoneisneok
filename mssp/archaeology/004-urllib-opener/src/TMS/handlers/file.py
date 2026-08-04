"""Serves file: URLs from a root it is handed."""
from __future__ import annotations

from pathlib import Path

name = "handlers/file"


class FileHandler:
    name = name

    def __init__(self, root: Path) -> None:
        self._root = root

    def file_open(self, url: str) -> str:
        target = (self._root / url.partition(":")[2].lstrip("/")).resolve()
        if self._root.resolve() not in target.parents:
            return "refused: outside the served root"
        return target.read_text(encoding="utf-8") if target.is_file() else "no such file"
