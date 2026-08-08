"""Which channels agreed, which differed, and whether the difference was declared."""


def render(alias, observer, result, policy_note):
    lines = ["", f"== {alias['old_name']} -> {alias['replacement']}  (observer {alias['equivalence']['observer']})"]
    lines.append(f"   host: {alias['host_constraint']}")
    lines.append("")
    for channel, ok, why, values in result["clauses"]:
        lines.append(f"  {'ok ' if ok else '!! '} {channel:<9} {why}")
        if values:
            lines.append(f"        old: {values[0]!r}")
            lines.append(f"        new: {values[1]!r}")
    lines.append("")
    if result["unexercised_permissions"]:
        lines.append(f"  permissions granted but never needed on this run: "
                     f"{', '.join(result['unexercised_permissions'])}")
    else:
        lines.append("  every declared permission was exercised by this run")
    lines.append(f"  {policy_note}")
    lines.append("")
    lines.append(f"  the declaration {'HOLDS' if result['holds'] else 'DOES NOT HOLD'} under this observer,")
    lines.append("  and 'this observer' is three named channels a person chose.")
    return "\n".join(lines) + "\n"
