"""The two modes side by side, the comparison, and the gaps."""


def modes(rows, out):
    out(f"\n  {'writeback':<12} {'d[k].append(x) survives':<26} {'d[k] is d[k]':<14} objects held")
    for row in rows:
        out(f"  {str(row['writeback']):<12} {str(row['survived']):<26} "
            f"{str(not row['identity_separates']):<14} {row['held']}")


def growth(marks, out):
    out("\n  reads only, nothing written:")
    for read, held in sorted(marks.items()):
        out(f"    after reading {read:>4} keys, the cache holds {held}")


def nothing_discriminating(values, out):
    out("\n  operations whose answer is the same however they went:")
    for label, value in values.items():
        out(f"    {label:<26} {value!r}")


def comparison(disagreements, cells, out):
    if disagreements:
        for line in disagreements:
            out(f"    DISAGREES  {line}")
    else:
        out(f"    {cells} of {cells} cells agree - the lifted strategy decides what "
            f"the flag decided")


def gaps(out):
    out("\n  measurable, not measured here:")
    out("    - how often real code mutates what a shelf handed it")
    out("    - what the retained objects cost on a session-sized workload")
    out("\n  not measurable by this entry at all:")
    out("    - whether the default is wrong. It is off, it is documented, and")
    out("      turning it on costs memory that most callers do not want to spend.")
    out("    - whether anyone has been bitten in production. Reproducing a silent")
    out("      loss says nothing about how often it happens.")
