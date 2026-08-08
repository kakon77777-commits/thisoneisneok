"""What this deployment will accept as a permitted difference."""
import json
import pathlib

_C = json.loads((pathlib.Path(__file__).parent / "policy.json").read_text(encoding="utf-8"))


def accepts_channel_deltas():
    return bool(_C["accept_channel_deltas"])


def never_differ():
    return list(_C["channels_that_must_never_differ"])
