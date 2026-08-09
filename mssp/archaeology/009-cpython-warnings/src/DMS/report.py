"""What was seen, under which observer, and what that observer cannot see."""


def render(record, results, channel, policy_note):
    out = ["", "== the same code, watched two ways"]
    for name, seen in results.items():
        spec = record["observers"][name]
        mark = "!! " if spec["perturbs_the_channel"] else "ok "
        out.append(f"  {mark} {name:<10} delivered {len(seen['delivered'])}"
                   f"   perturbs the channel: {spec['perturbs_the_channel']}")
        out.append(f"        sees   {spec['sees']}")
        out.append(f"        cost   {spec['cost']}")

    out.append("")
    out.append(f"  attempts made by the code : {len(channel.attempted)}")
    out.append(f"  notices actually delivered: {len(channel.delivered)}")
    out.append(f"  suppressed by the memory  : {channel.suppressed()}")
    out.append("")
    out.append(f"  {policy_note}")
    out.append("")
    out.append("  A figure from a perturbing observer is not wrong. It answers a different")
    out.append("  question — 'how often does the code try' rather than 'how often does anyone")
    out.append("  hear' — and a report that does not name the observer lets a reader take one")
    out.append("  for the other.")
    return "\n".join(out) + "\n"
