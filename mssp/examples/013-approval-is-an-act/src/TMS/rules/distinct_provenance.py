"""Approved when the records were also PLACED by different parties.

The only rule here that reads something the artifacts do not contain. Provenance
is who committed each file, and it lives outside the file — which is the whole
point: an act leaves a trace outside the thing it is about, or it is content.

What it cannot do is verify that the provenance itself is honest. Archaeology
013 measures the ceiling: git's author field is settable with a documented
environment variable, and the only field that is an act rather than a claim is a
signature — which reports the same value for an honest commit and an
impersonation when nobody signs.
"""
NAME = "distinct-provenance"
READS = ["an approval record", "its digest", "who placed the record, from outside the record"]
CANNOT_DISTINGUISH = ["an honest actor", "an actor whose provenance is itself forged"]


def approved(claim, parties, provenance):
    placers = set()
    for party in parties:
        record = next((r for r in party["approvals"] if r["claim"] == claim), None)
        if record is None or record["digest"] != party["holds"].get(claim, {}).get("digest"):
            return False
        placers.add(provenance.get(party["name"]))
    return len(placers) == len(parties) and None not in placers
