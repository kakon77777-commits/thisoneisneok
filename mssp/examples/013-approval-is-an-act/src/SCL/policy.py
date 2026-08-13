"""Which rule this deployment trusts, and what it refuses to ship."""
import json
import pathlib

_C = json.loads((pathlib.Path(__file__).parent / "policy.json").read_text(encoding="utf-8"))

rule = lambda: _C["rule"]                                                              # noqa: E731
indistinguishable_is_fatal = lambda: bool(_C["a_rule_that_cannot_separate_the_worlds_is_fatal"])  # noqa: E731
