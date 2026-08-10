"""What the review saw, what it was based on, and what nothing here is watching."""

MARK = {"exempt": "ok", "review": "!!"}


def rows(review_rows, out):
    current = None
    for row in review_rows:
        if row["round"] != current:
            current = row["round"]
            out(f"\n  {row['round']}  {row['date']}")
        out(f"    {MARK[row['verdict']]}  {row['path']:<24} {row['verdict']:<7} {row['because']}")
        evidence = row["evidence"]
        if evidence:
            out(f"            evidence   {evidence['observed']}  [about {evidence['about']}]")


def verdict_counts(review_rows, out):
    counts = {}
    for row in review_rows:
        counts[row["code"]] = counts.get(row["code"], 0) + 1
    for code in sorted(counts):
        out(f"    {counts[code]:>2}  {code}")


def blind_spots(out):
    """改良點 8: what was not solved, split into what cannot be measured here
    and what simply was not."""
    out("\n  not measured here, but measurable:")
    out("    - how often an exemption's evidence goes stale in a real repository")
    out("    - whether requiring `about` changes how often people write exemptions at all")
    out("\n  not measurable by this program at all:")
    out("    - whether an exemption SHOULD have been event-scoped. generated-file is")
    out("      unconditional because a generated file is generated; owner-waived is")
    out("      unconditional because someone said so. Only the second is a judgement,")
    out("      and nothing here can tell them apart - the contract records which is which")
    out("      because a person decided, not because the program found out.")
