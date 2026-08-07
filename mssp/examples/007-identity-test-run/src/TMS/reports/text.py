"""Human-readable report. Imports nothing, takes plain values."""

NAME = "reports/text"


def render(summary, rows):
    lines = ["", "  reconciliation"]
    lines.append(f"    matched          {summary['matched']}")
    lines.append(f"    differing        {summary['differing']}")
    lines.append(f"    only in left     {summary['only_left']}")
    lines.append(f"    only in right    {summary['only_right']}")
    lines.append(f"    net difference   {summary['net_difference_cents']} cents")
    if rows:
        lines.append("")
        for row in rows:
            lines.append(f"    {row['id']:<8} {row['left']:>10} {row['right']:>10}  {row['note']}")
    return "\n".join(lines) + "\n"
