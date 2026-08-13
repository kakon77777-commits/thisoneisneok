"""Which rules said approved where, and which of them could not have said otherwise."""


def table(rows, out):
    worlds = list(rows[0]["verdicts"])
    out(f"\n  {'rule':<22} {'reads':<6} " + "  ".join(f"{w:<15}" for w in worlds) + " separates?")
    for row in rows:
        cells = "  ".join(f"{('approved' if row['verdicts'][w] else 'refused'):<15}" for w in worlds)
        separates = len(set(row["verdicts"].values())) > 1
        out(f"  {row['rule']:<22} {row['reads']:<6} {cells} {'YES' if separates else 'no'}")


def blindness(rows, out):
    out("\n  what each rule declares it cannot distinguish:")
    for row in rows:
        out(f"    {row['rule']:<22} {row['declared_blind_to'][1]}")


def gaps(out):
    out("\n  measurable, not measured here:")
    out("    - what requiring distinct provenance costs a party that legitimately")
    out("      acts on another's behalf")
    out("\n  not measurable by this program at all:")
    out("    - whether the provenance store is honest. This moves the question")
    out("      from the artifacts to who placed them; it does not end it, and")
    out("      archaeology 013 measures exactly where that ends.")
    out("    - whether a party who wrote an approval meant it. Nothing here, and")
    out("      nothing anywhere, reads intent.")
