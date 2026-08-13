"""Approved when every party's record binds the exact content they read.

The digest stops an approval surviving an edit to the thing approved, which is a
real property and not the one under test here. One author can still write three
digest-bound records.
"""
NAME = "digest-bound-record"
READS = ["an approval record", "the digest of the claim it names"]
CANNOT_DISTINGUISH = ["three parties approving", "one party writing three records"]


def approved(claim, parties, provenance):
    for party in parties:
        record = next((r for r in party["approvals"] if r["claim"] == claim), None)
        if record is None or record["digest"] != party["holds"].get(claim, {}).get("digest"):
            return False
    return True
