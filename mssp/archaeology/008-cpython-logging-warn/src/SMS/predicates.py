"""Executable predicates for allowed deltas.

Metron ran this entry on 2026-08-08 and replaced the real difference with
`RuntimeWarning("not a deprecation and does not name replacement")`. The
contract still returned holds: true, because the record's

    permit: one DeprecationWarning naming the replacement

was prose. The check only asked whether the `warnings` channel appeared in
allowed_deltas — it never read the sentence. **The declaration looked precise
and the verdict read a wider layer**, which is the exact shape this field lab
keeps finding in other people's code.

A permit is now an id resolved here. An id that does not resolve fails closed:
an unverifiable declaration is not a permitted difference, it is an unchecked
one.
"""


def _one_deprecation_warning_naming_replacement(before, after, alias):
    """The old name raises exactly one DeprecationWarning that names the new name."""
    old = before.get("warnings", [])
    new = after.get("warnings", [])
    if new:
        return f"the replacement raised {len(new)} warning(s); it must raise none"
    if len(old) != 1:
        return f"the old name raised {len(old)} warning(s); the permit allows exactly one"
    category, message = old[0]
    if category != "DeprecationWarning":
        return f"the warning is a {category}; the permit allows only DeprecationWarning"
    if alias["replacement"] not in message:
        return (f"the warning does not name the replacement "
                f"({alias['replacement']!r} not in {message!r})")
    return None


REGISTRY = {
    "one-deprecation-warning-naming-replacement-v1": _one_deprecation_warning_naming_replacement,
}


def resolve(name):
    """Return (predicate, problem). A missing id is a problem, never a pass."""
    if not name:
        return None, "the allowed delta names no predicate"
    if name not in REGISTRY:
        return None, f'predicate "{name}" does not resolve — fail closed'
    return REGISTRY[name], None
