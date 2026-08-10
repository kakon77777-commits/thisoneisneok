"""The discrimination table, the comparison against the real interpreter, and the gaps."""


def table(rows, out):
    out(f"\n  {'the edit':<34} {'metadata':<10} {'bytes':<7} {'timestamp':<11} {'checked':<9} unchecked")
    for row in rows:
        cells = [f"{row['verdict'][mode]:<11}" for mode in ("timestamp", "checked_hash")]
        out(f"  {row['label']:<34} {row['metadata']:<10} {row['bytes']:<7} "
            f"{cells[0]}{cells[1][:9]:<9} {row['verdict']['unchecked_hash']}")


def distinct_values(rows, out):
    out("\n  how many answers each validator gave across four edits that ALL changed the source:")
    for mode in ("timestamp", "checked_hash", "unchecked_hash"):
        values = sorted({row["verdict"][mode] for row in rows})
        out(f"    {mode:<15} {len(values)}  {', '.join(values)}")


def evidence_about(validators, out):
    out("\n  every mode stores eight bytes in the same two header fields:")
    for module in validators:
        reads = ", ".join(module.READS) or "nothing at import time"
        out(f"    {module.MODE:<15} flags={module.FLAGS}  about {module.ABOUT}")
        out(f"    {'':<15} reads {reads}")


def gaps(out):
    out("\n  measurable, not measured here:")
    out("    - how often a real edit lands inside one mtime second in ordinary work")
    out("    - what checked-hash costs on a large import graph, in wall clock")
    out("\n  not measurable by this entry at all:")
    out("    - whether upstream's default is wrong. It is the default because reading")
    out("      every source file at import time is a real cost, and PEP 552 left it")
    out("      the default when it added the alternative. Nothing here weighs that.")
    out("    - whether anyone has ever been bitten by it in production. Reproducing a")
    out("      failure is not evidence of its frequency.")
