"""CPython's .pyc invalidation, re-cut into MSSP sets and checked against the real thing.

    python src/main.py            the discrimination table and the comparison
    python src/main.py --strict   exit 1 if the re-cut disagrees with the interpreter

Twelve subprocesses run: four edits that all change the source, under three
invalidation modes. Takes a couple of seconds.
"""
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE))

from DMS import report  # noqa: E402
from SCL import policy  # noqa: E402
from SMS import cache, upstream  # noqa: E402

ARCH = json.loads((HERE / "FMS" / "architecture.json").read_text(encoding="utf-8"))


def collect():
    """Measure upstream, run the re-cut over the same states, and pair them up."""
    loaded, problems = cache.load_validators()
    by_name = {module.MODE.lower(): module for module in loaded.values()}
    rows, disagreements = [], []

    for edit in upstream.EDITS:
        verdicts, model_verdicts = {}, {}
        metadata = bytes_moved = None
        for mode_name in upstream.MODES:
            measured = upstream.probe(edit, mode_name)
            metadata = "moved" if measured["metadata_moved"] else "unchanged"
            bytes_moved = "changed" if measured["bytes_moved"] else "same"

            module = by_name[mode_name]
            header = cache.read_header(cache.header_for(module, measured["before"]))
            model_fresh = module.is_fresh(header, measured["after"])

            verdicts[mode_name] = "STALE RAN" if measured["ran_stale"] else "recompiled"
            model_verdicts[mode_name] = model_fresh
            if model_fresh != measured["ran_stale"]:
                disagreements.append(
                    f"{edit['id']}/{mode_name}: re-cut says fresh={model_fresh}, "
                    f"interpreter ran {'stale' if measured['ran_stale'] else 'fresh'} code")

        rows.append({"id": edit["id"], "label": edit["label"], "metadata": metadata,
                     "bytes": bytes_moved, "verdict": verdicts, "model": model_verdicts})
    return rows, [module for _, module in sorted(loaded.items())], disagreements, problems


def main(argv):
    out = lambda line="": sys.stdout.write(line + "\n")  # noqa: E731
    rows, validators, disagreements, problems = collect()
    if problems:
        for problem in problems:
            out(f"  !! {problem}")
        return 1

    out(f"\n== four edits, every one of them a change to the source  "
        f"[{ARCH['upstream'].split('/')[-1]} {ARCH['examined_version']}]")
    report.table(rows, out)
    report.distinct_values(rows, out)
    report.evidence_about(validators, out)

    out("\n== the re-cut against the interpreter that is running right now")
    if disagreements:
        for line in disagreements:
            out(f"    DISAGREES  {line}")
    else:
        out(f"    {len(rows) * 3} of {len(rows) * 3} cells agree - the lifted validator decides "
            f"what the import system decided")

    out("\n== the numbers FMS declares, re-measured")
    declared = ARCH["declared_and_then_remeasured"]
    measured = upstream.measured_facts()
    wrong = []
    for key, value in measured.items():
        agrees = declared.get(key) == value
        if not agrees:
            wrong.append(f"{key}: declared {declared.get(key)!r}, measured {value!r}")
        out(f"    {'ok ' if agrees else 'NO '} {key:<32} {value}")

    out("\n== what an unreadable flags field does, against a control")
    # The control is the point. Without a run where the cache IS used, "it
    # printed BBB" means nothing - see the note in upstream.unsupported_flags.
    control = upstream.unsupported_flags(0)
    unreadable = upstream.unsupported_flags(0b100)
    for probe, label in ((control, "flags=0 (timestamp, stale cache)"),
                         (unreadable, "flags=0b100 (bits nothing defines)")):
        outcome = "cache used, stale code ran" if probe["cache_used"] else (
            "cache rejected, source recompiled" if probe["recompiled"] else "neither: " + probe["ran"])
        out(f"    {label:<38} exit {probe['exit']}  ran {probe['ran']:<5} {outcome}")
    out("    so unsupported flags do not stop the import - they discard the cache")

    report.gaps(out)

    if "--strict" in argv and (wrong or (disagreements and policy.model_must_match_upstream())):
        for line in wrong:
            out(f"\n  !! {line}")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
