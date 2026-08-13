"""Which field this deployment would trust for identity."""
import json
import pathlib

_C = json.loads((pathlib.Path(__file__).parent / "policy.json").read_text(encoding="utf-8"))

trusted = lambda: _C["field_trusted_for_identity"]                                # noqa: E731
claim_as_identity_is_fatal = lambda: bool(_C["a_claim_field_used_as_identity_is_fatal"])  # noqa: E731
