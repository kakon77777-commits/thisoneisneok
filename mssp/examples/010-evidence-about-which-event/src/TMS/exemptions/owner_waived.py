"""Someone decided this file is exempt while a rewrite is in flight.

Same shape as generated-file — unconditional, owner, sunset — and the only
difference in this history is that this one's sunset has passed. That is what
the sunset is for: an unconditional exemption is allowed, an unconditional
exemption that outlives its reason is the thing being caught.
"""
RULE = "owner-waived"


def look(change, ctx):
    waiver = ctx["declarations"]["waivers"].get(change["path"])
    if not waiver:
        return None
    return {
        "rule": RULE,
        "about": "*",
        "subject": change["path"],
        "unconditional": True,
        "observed": waiver["reason"],
        "owner": waiver["owner"],
        "sunset": waiver["sunset"],
    }
