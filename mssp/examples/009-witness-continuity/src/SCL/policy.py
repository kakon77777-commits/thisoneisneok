"""What this deployment treats as fatal."""
import json
import pathlib

_C = json.loads((pathlib.Path(__file__).parent / "policy.json").read_text(encoding="utf-8"))

removal_is_fatal = lambda: _C["unexplained_removal"] == "fatal"          # noqa: E731
every_clause_must_be_falsifiable = lambda: bool(_C["require_every_clause_falsifiable"])  # noqa: E731
every_named_witness_must_be_valid = lambda: bool(_C["every_named_witness_must_be_valid"])  # noqa: E731
