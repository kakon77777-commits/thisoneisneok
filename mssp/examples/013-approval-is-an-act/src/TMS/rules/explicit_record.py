"""Approved when every party has written an approval record.

Better than reading content — an act is at least named. It still reads only the
artifacts, so one author writing three records satisfies it exactly as three
authors do.
"""
NAME = "explicit-record"
READS = ["an approval record in each party's own file"]
CANNOT_DISTINGUISH = ["three parties approving", "one party writing three records"]


def approved(claim, parties, provenance):
    return all(any(record["claim"] == claim for record in party["approvals"]) for party in parties)
