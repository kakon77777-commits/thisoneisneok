"""CPython's dbm backends under a written-down schedule.

    python src/main.py            the two failures, side by side, per backend
    python src/main.py --strict   exit 1 if a declaration disagrees with behaviour
"""
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE))

from DMS import report  # noqa: E402
from SCL import policy  # noqa: E402
from SMS import backends, upstream  # noqa: E402

ARCH = json.loads((HERE / "FMS" / "architecture.json").read_text(encoding="utf-8"))


def main(argv):
    out = lambda line="": sys.stdout.write(line + "\n")  # noqa: E731
    schedules, problems = backends.load_schedules()
    if problems:
        for problem in problems:
            out(f"  !! {problem}")
        return 1

    out(f"\n== two failures that both get called 'concurrency'  "
        f"[python {sys.version.split()[0]}]")
    out(f"   shelve on this machine picks: {upstream.which_backend_shelve_uses()}")
    out(f"   backends available here:      {', '.join(sorted(upstream.BACKENDS)) or 'none'}")
    missing = [name for name in backends.GUARANTEES if name not in upstream.BACKENDS]
    if missing:
        out(f"   unavailable, so untested:     {', '.join(sorted(missing))}")

    rows = []
    for backend_name, module in sorted(upstream.BACKENDS.items()):
        for schedule_name, schedule in sorted(schedules.items()):
            lost = upstream.lost_update(module, schedule.order(2, 3))
            torn = upstream.torn_index(module) if schedule_name == "interleaved" else {
                "survived": None, "expected": None, "missing": None, "error": None}
            rows.append({"backend": backend_name, "schedule": schedule_name, **lost, **torn})
    report.table(rows, out)

    out("\n  The two columns are two different guarantees. A backend can hold the")
    out("  right-hand one and lose the left-hand one, and both are described as")
    out("  being safe for concurrent use.")

    report.declarations({name: upstream.declaration(module)
                         for name, module in sorted(upstream.BACKENDS.items())}, out)

    out("\n== what each schedule can reveal, checked by running it")
    wrong = []
    for schedule_name, schedule in sorted(schedules.items()):
        revealed = set()
        for module in upstream.BACKENDS.values():
            if upstream.lost_update(module, schedule.order(2, 3))["lost"]:
                revealed.add("lost-update")
        claimed = set(schedule.REVEALS) & {"lost-update"}
        agrees = revealed == claimed
        if not agrees:
            wrong.append(f"{schedule_name}: declares {sorted(claimed)}, revealed {sorted(revealed)}")
        out(f"    {'ok ' if agrees else 'NO '} {schedule_name:<15} declares {schedule.REVEALS}, "
            f"revealed {sorted(revealed) or 'nothing'}")

    out("\n== the requirement comparison the caller never gets to make")
    for operation in sorted(backends.REQUIREMENTS):
        for backend_name in sorted(upstream.BACKENDS):
            gap = backends.unmet(operation, backend_name)
            out(f"    {operation:<20} on {backend_name:<14} "
                f"{'unmet: ' + ', '.join(gap) if gap else 'satisfied'}")
    out("\n    dbm.open() gives no way to ask any of this. The table above is the")
    out("    re-cut's addition, and every row of it was measured, not read.")

    report.gaps(out)

    if "--strict" in argv and wrong and policy.declarations_must_match_behaviour():
        for line in wrong:
            out(f"\n  !! {line}")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
