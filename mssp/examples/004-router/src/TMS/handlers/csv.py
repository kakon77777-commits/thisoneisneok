"""Validates a CSV document: every row the width of the header."""
from __future__ import annotations

name = "handlers/csv"


def handle(text: str) -> str:
    rows = [line.split(",") for line in text.strip().splitlines() if line.strip()]
    if not rows:
        return "empty"
    width = len(rows[0])
    bad = [i for i, row in enumerate(rows[1:], start=2) if len(row) != width]
    return f"{len(rows) - 1} row(s), width {width}, ragged at {bad}" if bad else f"{len(rows) - 1} row(s), all width {width}"
