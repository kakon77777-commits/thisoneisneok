"""Summarises a markdown document.

Loaded only when a Route names it. Nothing imports this file at module scope
except the resolver in main, which is the point: the router decided this was
the right capability without this file being on disk, let alone imported.
"""
from __future__ import annotations

name = "handlers/markdown"


def handle(text: str) -> str:
    headings = [line.lstrip("# ").strip() for line in text.splitlines() if line.startswith("#")]
    return f"{len(headings)} heading(s): " + "; ".join(headings[:3])
