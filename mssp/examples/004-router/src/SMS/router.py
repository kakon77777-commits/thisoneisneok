"""Choosing a capability for a request.

The router is SMS: remove it and the system cannot decide what to do with
anything, so the loop does not close. It is *not* a dispatcher — it never calls
what it selects, and it imports nothing from TMS.

Rules are data. That matters for two reasons beyond taste:

  - A rule set can be handed in, so the island test hands in one rule and
    asserts on the decision without any capability existing at all.
  - Rules that never fire and requests that match nothing can be counted, which
    is the only honest signal for "the rule set has stopped being enough".
    Without it, that judgement is a feeling, and 開發區 缺點 3 says the method
    currently has nothing better than a feeling.
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from SCL import policy                      # noqa: E402
from SMS.model import Request, Route        # noqa: E402


class Rule:
    def __init__(self, name: str, capability: str, *, when) -> None:
        self.name = name
        self.capability = capability
        self._when = when

    def matches(self, request: Request) -> bool:
        return bool(self._when(request))


class Router:
    def __init__(self, rules: list[Rule]) -> None:
        self.rules = rules
        # Counted per rule rather than derived from decisions afterwards: a rule
        # that never fires produces no decision to count, and that is the fact
        # worth surfacing.
        self.fired: dict[str, int] = {rule.name: 0 for rule in rules}
        self.unmatched: list[Request] = []
        self.refused: list[tuple[Request, str]] = []

    def route(self, request: Request) -> Route:
        for rule in self.rules:
            if not rule.matches(request):
                continue

            allowed, why = policy.may_use(request.actor, rule.capability)
            if not allowed:
                # A refusal is a decision, not an absence of one. Falling
                # through to the next rule here would let a caller reach a
                # capability by being denied a better-matching one.
                self.refused.append((request, why))
                return Route(None, rule.name, f"refused: {why}",
                             [f"{request.actor} -> {rule.capability}"])

            self.fired[rule.name] += 1
            return Route(rule.capability, rule.name, "matched",
                         [f"{rule.name} matched {request.kind}/{request.intent}"])

        self.unmatched.append(request)
        return Route(None, None, "no rule matched", [f"{request.kind}/{request.intent}"])

    def coverage(self) -> dict:
        """What this rule set did and did not cover.

        The two numbers 開發區 缺點 3 asks for. `never_fired` says the rule set
        carries weight it is not using; `unmatched` says it is not reaching
        requests that arrive. Both grow as a rule set ages, and both are
        countable, which a judgement about "scale" is not.
        """
        return {
            "rules": len(self.rules),
            "never_fired": sorted(name for name, n in self.fired.items() if n == 0),
            "unmatched": [f"{r.kind}/{r.intent}" for r in self.unmatched],
            "refused": [f"{r.actor}: {why}" for r, why in self.refused],
        }
