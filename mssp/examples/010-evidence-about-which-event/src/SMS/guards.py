"""Two guards over the same evidence. Only one of them asks what it is evidence OF.

Both are honest implementations. event-blind-v1 is not wrong about anything it
looks at — it is the version most people write, and across the whole history it
returns a single verdict, which is the property island_test.py section 3
measures rather than asserts.
"""


def event_blind_v1(change, evidence, view):
    if evidence is None:
        return {"verdict": "review", "code": "no-evidence",
                "because": "no exemption produced evidence"}
    return {"verdict": "exempt", "code": "evidence-exists",
            "because": f"{evidence['rule']} produced evidence"}


def event_scoped_v1(change, evidence, view):
    if evidence is None:
        return {"verdict": "review", "code": "no-evidence",
                "because": "no exemption produced evidence"}

    about = evidence.get("about")
    if not about:
        return {"verdict": "review", "code": "malformed-evidence",
                "because": "the evidence does not say what event it is about - fail closed"}

    if about == "*":
        missing = [f for f in view["unconditional_requires"] if not evidence.get(f)]
        if missing:
            return {"verdict": "review", "code": "malformed-evidence",
                    "because": f"unconditional evidence with no {', '.join(missing)} - fail closed"}
        # Dates are compared as ISO strings against the round's own date, not
        # against today, so this test means the same thing next month.
        if evidence["sunset"] < change["date"]:
            return {"verdict": "review", "code": "expired-waiver",
                    "because": f"{evidence['rule']} expired {evidence['sunset']}, this change is {change['date']}"}
        return {"verdict": "exempt", "code": "unconditional",
                "because": f"{evidence['rule']}, unconditional by declaration, {evidence['owner']} until {evidence['sunset']}"}

    if about != change["round"]:
        return {"verdict": "review", "code": "stale-evidence",
                "because": f"the evidence is about {about}, this change is {change['round']}"}

    return {"verdict": "exempt", "code": "evidence-about-this-event",
            "because": f"{evidence['rule']}, observed in {about}"}


IMPLEMENTATIONS = {
    "event-blind-v1": event_blind_v1,
    "event-scoped-v1": event_scoped_v1,
}


def resolve(name):
    """A guard id that does not resolve is not a warning. Nothing runs."""
    implementation = IMPLEMENTATIONS.get(name)
    if implementation is None:
        known = ", ".join(sorted(IMPLEMENTATIONS))
        return None, f'guard "{name}" has no implementation - fail closed (known: {known})'
    return implementation, None
