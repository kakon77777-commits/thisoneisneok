"""A generated file is generated. That is not an event, and dating it would be pedantry.

So this exemption returns `about: "*"` — unconditional by design — and pays for
that by carrying an owner and a sunset. The point is not that it never refuses;
the point is that "this can never refuse" is a position with someone's name on
it rather than something nobody noticed.
"""
RULE = "generated-file"


def look(change, ctx):
    declared = ctx["declarations"]["generated"].get(change["path"])
    if not declared:
        return None
    return {
        "rule": RULE,
        "about": "*",
        "unconditional": True,
        "observed": f"{change['path']} was declared generated in {declared['declared_in']}",
        "owner": declared["owner"],
        "sunset": declared["sunset"],
    }
