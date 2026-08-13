"""Approved when every party holds the same content.

This is what I shipped on 2026-08-12 and it was wrong within the hour: the three
files were identical because I wrote all three in one commit. Kept here as a
unit rather than deleted, because it is the thing the example is measuring.
"""
NAME = "identical-content"
READS = ["the content each party holds"]
CANNOT_DISTINGUISH = ["three parties agreeing", "one party writing three files"]


def approved(claim, parties, provenance):
    held = [party["holds"].get(claim) for party in parties]
    return all(h is not None for h in held) and len({str(h) for h in held}) == 1
