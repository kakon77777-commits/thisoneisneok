"""What a person is shown.

The one thing this report may never print is an exact count of incomplete
records, because it does not have one. It has a floor. Section 5 of the island
test checks that the word "at least" is in the sentence, and that no exact
count is offered anywhere near it.
"""


def rows(runs):
    lines = ["  source             outcome   records   finished   complete"]
    mark = {"worked": "ok", "empty": "--", "partial": "~~", "failed": "!!", "absent": "  "}
    for row in runs:
        detail = f' ({row["reason"]})' if row["reason"] else ""
        lines.append(
            f'  {mark[row["outcome"]]} {row["source"]:<16} {row["outcome"]:<9} '
            f'{len(row["records"]):<9} {str(row["finished"]) if row["finished"] is not None else "-":<10} '
            f'{(row["completeness"] or "-")}{detail}')
    return "\n".join(lines)


def floor(at_least, total):
    return "\n".join([
        f"  at least {at_least} of {total} records come from a source that declared itself incomplete.",
        "  This is a FLOOR and not a count: a source that is truncated and says nothing is",
        "  reported in the same column as one that is complete.",
    ])


def two_axes(runs):
    finished = [row for row in runs if row["finished"]]
    lines = ["  what `finished` alone would have said:"]
    for row in finished:
        lines.append(f'    {row["source"]:<16} finished, no error, {len(row["records"])} records')
    lines.append(f"    {len(finished)} sources, all of them clean, and they are not all complete")
    return "\n".join(lines)
