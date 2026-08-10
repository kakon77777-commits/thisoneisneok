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


def event_and_subject_scoped_v1(change, evidence, view):
    """Everything event-scoped-v1 does, plus what it cannot see.

    Added the same day the example shipped, because Metron probed their own
    runtime with a piece of evidence attached to the wrong subject inside the
    right snapshot, and the validator accepted it. Pointing the same probe here
    produced `exempt / evidence-about-this-event` — event-scoped-v1 never reads
    change["path"] at all, so it could not have refused.

    Composed on top rather than replacing it: the older guard is the artifact
    that reproduces the finding, and deleting it would delete the evidence.
    """
    verdict = event_scoped_v1(change, evidence, view)
    if verdict["verdict"] != "exempt":
        return verdict

    subject = evidence.get("subject")
    if not subject:
        return {"verdict": "review", "code": "malformed-evidence",
                "because": "the evidence does not say what it is about - fail closed"}
    if subject != change["path"]:
        return {"verdict": "review", "code": "wrong-subject",
                "because": f"the evidence is about {subject}, this change is {change['path']}"}
    return verdict


IMPLEMENTATIONS = {
    "event-blind-v1": event_blind_v1,
    "event-scoped-v1": event_scoped_v1,
    "event-and-subject-scoped-v1": event_and_subject_scoped_v1,
}


def resolve(name):
    """A guard id that does not resolve is not a warning. Nothing runs."""
    implementation = IMPLEMENTATIONS.get(name)
    if implementation is None:
        known = ", ".join(sorted(IMPLEMENTATIONS))
        return None, f'guard "{name}" has no implementation - fail closed (known: {known})'
    return implementation, None
