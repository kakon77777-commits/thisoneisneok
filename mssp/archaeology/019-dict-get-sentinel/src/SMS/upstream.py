"""Probes that run real dicts. Nothing here is simulated."""
import sys

# The two situations the entry is about.
PRESENT_NONE = {"a": None}
MISSING = {}

# Everything the idiomatic falsy test folds together, with a control at the end
# that must come out differently. Without the control, "they all take the same
# branch" would be a statement about the test rather than about the values.
FALSY_CASES = {
    "missing": {},
    "present None": {"a": None},
    "zero": {"a": 0},
    "empty string": {"a": ""},
    "False": {"a": False},
    "empty list": {"a": []},
    "present truthy (control)": {"a": 7},
}


def versions():
    return f"python {sys.version.split()[0]}"


def through(reader, mapping, key="a"):
    return {"reader": reader.READER, **reader.read(mapping, key)}


def separates(reader, key="a"):
    """Measured, not read off the unit's own declaration."""
    on_none = reader.read(PRESENT_NONE, key)
    on_missing = reader.read(MISSING, key)
    return (on_none.get("present"), on_none.get("raised")) != (on_missing.get("present"),
                                                               on_missing.get("raised"))


def falsy_table(key="a"):
    rows = []
    for label, mapping in FALSY_CASES.items():
        rows.append({
            "case": label,
            "falsy": not mapping.get(key),
            "has_key": key in mapping,
        })
    return rows


def collapsed(rows):
    """How many distinct situations reach the same branch of `if not d.get(k)`."""
    return sum(1 for row in rows if row["falsy"])


def of_those_present(rows):
    return sum(1 for row in rows if row["falsy"] and row["has_key"])
