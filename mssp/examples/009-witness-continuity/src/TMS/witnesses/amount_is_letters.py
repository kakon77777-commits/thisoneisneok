"""non-numeric text where a number is required"""


def build():
    return {"total": 30.0, "rows": [
        {"id": "A-1", "amount": "twelve", "date": "2026-08-09"},
        {"id": "A-2", "amount": 18.0, "date": "2026-08-09"},
    ]}
