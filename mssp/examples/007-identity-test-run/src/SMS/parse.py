"""Read a ledger from text into entries. Remove it and there is no input."""


def parse(text):
    entries = []
    for line_no, raw in enumerate(text.strip().split("\n"), start=1):
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        parts = [p.strip() for p in line.split(",")]
        if len(parts) != 3:
            raise ValueError(f"line {line_no}: expected id,description,amount")
        entries.append({"id": parts[0], "description": parts[1], "amount_raw": parts[2]})
    return entries
