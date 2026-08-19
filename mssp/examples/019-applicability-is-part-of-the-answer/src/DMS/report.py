"""What a person is shown.

An unmeasured reading is never rendered in the same column shape as a measured
one. `n/a` is a different kind of cell from `0`, and the report says which.
"""


def measurements(measured):
    lines = ["  unit              suppressed   declared   incentive   reading"]
    for m in measured:
        if not m["applicable"]:
            lines.append(f'  {m["source"]:<17} {"-":<12} {m["declared"]:<10} {"n/a":<11} '
                         f'NOT MEASURED: {m["reason"]}')
            continue
        reading = ("declaring PAID" if m["value"] > 0
                   else "declaring COST it" if m["value"] < 0
                   else "measured zero - both arms ran and agreed")
        value = f'+{m["value"]}' if m["value"] > 0 else str(m["value"])
        lines.append(f'  {m["source"]:<17} {m["suppressed"]:<12} {m["declared"]:<10} '
                     f'{value:<11} {reading}')
    return "\n".join(lines)


def what_a_bare_number_would_have_said(measured):
    zeros = [m for m in measured if not m["applicable"] or m["value"] == 0]
    lines = ["  what a bare number would have said:"]
    for m in zeros:
        state = "not measurable" if not m["applicable"] else "measured, and genuinely zero"
        lines.append(f'    {m["source"]:<17} 0 - and this is {state}')
    kinds = len({m["applicable"] for m in zeros})
    lines.append(f"    {len(zeros)} units, one number, {kinds} kinds of answer")
    return "\n".join(lines)


def refusal(error):
    return "\n".join([
        f"  the total refuses: {error}",
        "  A sum that skips what it could not measure reports a smaller number with the",
        "  same confidence as a complete one.",
    ])
