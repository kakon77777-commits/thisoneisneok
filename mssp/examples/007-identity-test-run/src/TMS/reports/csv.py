"""Machine-readable report. Imports nothing, takes plain values."""

NAME = "reports/csv"


def render(summary, rows):
    out = ["metric,value"]
    for key in ("matched", "differing", "only_left", "only_right", "net_difference_cents"):
        out.append(f"{key},{summary[key]}")
    out.append("")
    out.append("id,left,right,note")
    for row in rows:
        out.append(f"{row['id']},{row['left']},{row['right']},{row['note']}")
    return "\n".join(out) + "\n"
