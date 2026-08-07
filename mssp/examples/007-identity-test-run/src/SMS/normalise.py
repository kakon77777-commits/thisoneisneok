"""Amounts as integer cents. Remove it and nothing can be compared."""


def normalise(entries):
    out = []
    for entry in entries:
        raw = entry["amount_raw"].replace("$", "").replace(",", "").strip()
        negative = raw.startswith("(") and raw.endswith(")")
        if negative:
            raw = raw[1:-1]
        cents = int(round(float(raw) * 100))
        out.append({**entry, "cents": -cents if negative else cents})
    return out
