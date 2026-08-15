"""The outcome per source, and whether the run was degraded."""

MARK = {"worked": "ok ", "empty": "-- ", "failed": "!! ", "absent": "   "}


def outcomes(rows, out):
    out(f"\n  {'source':<15} {'outcome':<9} {'records':<9} failed with")
    for row in rows:
        out(f"  {MARK[row['outcome']]}{row['source']:<12} {row['outcome']:<9} "
            f"{row['records']:<9} {row['failed'] or ''}")


def headline(rows, total, degraded, out, must_say_so):
    """The line a caller reads. It is the whole point that it cannot be just a number."""
    if degraded and must_say_so:
        out(f"\n  {total} record(s) — DEGRADED: {', '.join(r['source'] for r in degraded)} failed")
    else:
        out(f"\n  {total} record(s)")


def collapse(rows, out):
    out("\n  what a count alone would have said:")
    for row in rows:
        if row["records"] == 0:
            out(f"    {row['source']:<15} 0 records — and this is {row['outcome']}")
    out("    three different situations, one number")


def gaps(out):
    out("\n  measurable, not measured here:")
    out("    - how often a real source is present-and-failing rather than absent")
    out("    - what a degraded run costs a caller who served it as complete")
    out("\n  not measurable by this program at all:")
    out("    - whether a degraded run should be served. fatal, degrade and ignore")
    out("      are all defensible; this deployment picks one and says which.")
    out("    - partial failure. A source that returned some records and THEN broke")
    out("      is a fifth outcome and is not modelled — the classifier here would")
    out("      call it `worked`.")
