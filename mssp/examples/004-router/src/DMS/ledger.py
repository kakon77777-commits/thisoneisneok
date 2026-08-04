"""What the routing did, and what it did not reach.

The second half is the one 開發區 缺點 3 asked for. "When does a rule-based
router stop being enough?" has been a judgement call; these are the two numbers
that make it a measurement:

  never_fired   the rule set is carrying weight it is not using
  unmatched     requests are arriving that no rule reaches

Neither is an error. A young rule set has unmatched requests because it is
young; an old one has never-fired rules because the world moved. What matters is
the direction over time, and you cannot have a direction without a number.
"""
from __future__ import annotations


def render(coverage: dict, decisions: list) -> str:
    lines = ["  decisions"]
    for request, route in decisions:
        target = route.capability or "(none)"
        asked = f"{request.kind}/{request.intent}"
        lines.append(f"    {request.actor:<14} {asked:<20} -> {target:<20} {route.why}")

    lines.append("")
    lines.append("  coverage")
    lines.append(f"    rules             {coverage['rules']}")

    if coverage["never_fired"]:
        lines.append(f"    never fired       {', '.join(coverage['never_fired'])}")
        lines.append("                      the rule set carries weight it did not use")
    else:
        lines.append("    never fired       none - every rule was reached")

    if coverage["unmatched"]:
        lines.append(f"    unmatched         {', '.join(coverage['unmatched'])}")
        lines.append("                      requests arrived that no rule reaches")
    else:
        lines.append("    unmatched         none")

    if coverage["refused"]:
        lines.append(f"    refused           {'; '.join(coverage['refused'])}")
    return "\n".join(lines)
