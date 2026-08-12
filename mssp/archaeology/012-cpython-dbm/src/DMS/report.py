"""The two failures side by side, and what none of it can see."""


def table(rows, out):
    out(f"\n  {'backend':<14} {'schedule':<15} {'two +1 from 0':<15} "
        f"{'lost':<6} {'40 distinct keys':<18} missing")
    for row in rows:
        lost = "-" if row["lost"] in (0, None) else str(row["lost"])
        survived = (f"{row['survived']} of {row['expected']}"
                    if row["survived"] is not None else "n/a")
        missing = "-" if not row["missing"] else str(row["missing"])
        out(f"  {row['backend']:<14} {row['schedule']:<15} {str(row['final']):<15} "
            f"{lost:<6} {survived:<18} {missing}")


def declarations(rows, out):
    out("\n  where each module says something about concurrent access:")
    for backend, info in rows.items():
        where = info["says_in_docstring"] or "nowhere"
        out(f"    {backend:<14} {info['lines']:>4} lines   {where[:64]}")
        if info["locking_primitives"]:
            out(f"    {'':<14} uses {', '.join(info['locking_primitives'])}")


def gaps(out):
    out("\n  measurable, not measured here:")
    out("    - how the backends behave under a real scheduler rather than this one")
    out("    - what the sqlite backend's locking costs in throughput")
    out("\n  not measurable by this entry at all:")
    out("    - whether any of this has ever bitten anyone. Reproducing a lost")
    out("      update says nothing about how often two writers meet.")
    out("    - the backends this machine does not have. dbm.gnu and dbm.ndbm are")
    out("      absent here, so every statement about them is a guess and is")
    out("      printed as unavailable rather than assumed.")
