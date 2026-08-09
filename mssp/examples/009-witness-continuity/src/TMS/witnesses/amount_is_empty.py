"""an absent value where a number is required"""


def build():
    return {"total": 18.0, "rows": [
        {"id": "B-1", "amount": "", "date": "2026-08-09"},
        {"id": "B-2", "amount": 18.0, "date": "2026-08-09"},
    ]}
