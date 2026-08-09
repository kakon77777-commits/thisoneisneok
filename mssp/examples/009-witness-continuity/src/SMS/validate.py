"""The clauses themselves. Each returns a list of complaints."""


def _rows(ledger):
    return ledger.get("rows", [])


def amount_is_a_number(ledger):
    out = []
    for row in _rows(ledger):
        raw = row.get("amount")
        try:
            float(str(raw).strip())
        except (TypeError, ValueError):
            out.append(f"{row.get('id')}: amount {raw!r} is not a number")
    return out


def id_is_unique(ledger):
    seen, out = set(), []
    for row in _rows(ledger):
        if row.get("id") in seen:
            out.append(f"{row.get('id')}: appears more than once")
        seen.add(row.get("id"))
    return out


def date_is_iso(ledger):
    out = []
    for row in _rows(ledger):
        value = str(row.get("date", ""))
        parts = value.split("-")
        ok = len(parts) == 3 and all(p.isdigit() for p in parts) and len(parts[0]) == 4
        if ok:
            year, month, day = (int(p) for p in parts)
            days = [31, 29 if year % 4 == 0 and (year % 100 or year % 400 == 0) else 28,
                    31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
            ok = 1 <= month <= 12 and 1 <= day <= days[month - 1]
        if not ok:
            out.append(f"{row.get('id')}: date {value!r} is not a valid YYYY-MM-DD")
    return out


def total_matches_rows(ledger):
    declared = ledger.get("total")
    try:
        total = sum(float(r["amount"]) for r in _rows(ledger))
    except (TypeError, ValueError, KeyError):
        return []          # amount-is-a-number owns that complaint
    if declared is None:
        return ["no total declared"]
    if abs(float(declared) - total) > 1e-9:
        return [f"declared total {declared} but the rows sum to {total}"]
    return []


CLAUSES = {
    "amount-is-a-number": amount_is_a_number,
    "id-is-unique": id_is_unique,
    "date-is-iso": date_is_iso,
    "total-matches-rows": total_matches_rows,
}
