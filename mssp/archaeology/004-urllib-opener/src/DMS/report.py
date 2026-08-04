"""What binding actually did.

Upstream `add_handler` returns None in every case: five methods bound, one
bound, none bound. This prints the same three cases differently, which is the
entire difference between a registry you can trust and one you hope about.
"""
from __future__ import annotations


def render(bindings) -> str:
    lines = ["  bindings"]
    for b in bindings:
        if b.bound_anything:
            lines.append(f"    {b.handler:<18} bound {', '.join(b.schemes)}")
        else:
            lines.append(f"    {b.handler:<18} BOUND NOTHING")
        for attr in b.ignored:
            lines.append(f"    {'':<18}   near-miss method `{attr}` - did you mean `{attr.rsplit('_', 1)[0]}_open`?")
        for scheme in b.refused:
            lines.append(f"    {'':<18}   refused {scheme}")
    return "\n".join(lines)


def inert(bindings) -> list[str]:
    """Handlers that registered nothing. Constructing one is always a mistake."""
    return [b.handler for b in bindings if not b.bound_anything]
