"""CPython's shelve, re-cut so the handout strategy is a unit rather than a flag.

    python src/main.py            the two modes, the growth, and the comparison
    python src/main.py --strict   exit 1 if the re-cut disagrees with real shelve
"""
import json
import pathlib
import pickle
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE))

from DMS import report  # noqa: E402
from SCL import policy  # noqa: E402
from SMS import shelf, upstream  # noqa: E402

ARCH = json.loads((HERE / "FMS" / "architecture.json").read_text(encoding="utf-8"))
BY_WRITEBACK = {False: "copy-on-read", True: "cached-reference"}


def recut(handout_name, loaded):
    """The same three operations the upstream probe performs, through the re-cut."""
    module, problem = shelf.resolve(handout_name, loaded)
    if problem:
        return None, problem
    backing = {}
    store = shelf.Shelf(backing, module)
    store["cart"] = ["apple"]

    store2 = shelf.Shelf(backing, module)
    store2["cart"].append("pear")
    identity_separates = shelf.hands_back_copies(store2, "cart")
    held = store2.held()
    store2.sync()

    survived = pickle.loads(backing[b"cart"])
    return {"survived": survived, "mutation_survives": survived == ["apple", "pear"],
            "identity_separates": identity_separates, "held": held}, None


def main(argv):
    out = lambda line="": sys.stdout.write(line + "\n")  # noqa: E731
    loaded, problems = shelf.load_handouts()
    if problems:
        for problem in problems:
            out(f"  !! {problem}")
        return 1

    out(f"\n== one interface, two meanings for the same call  "
        f"[shelve.py {ARCH['examined_version']}]")
    rows, disagreements = [], []
    for writeback, handout_name in BY_WRITEBACK.items():
        measured = upstream.probe(writeback)
        rows.append({"writeback": writeback, **measured})

        modelled, problem = recut(handout_name, loaded)
        if problem:
            out(f"  !! {problem}")
            return 1
        for field in ("mutation_survives", "identity_separates"):
            if modelled[field] != measured[field]:
                disagreements.append(
                    f"writeback={writeback}/{field}: re-cut {modelled[field]}, "
                    f"shelve {measured[field]}")
    report.modes(rows, out)

    out("\n== the flag is called writeback, and what it changes first is reads")
    report.growth(upstream.cache_after_pure_reads(200), out)

    report.nothing_discriminating(upstream.returns_nothing_discriminating(), out)

    out("\n== the re-cut against the shelve that is running right now")
    report.comparison(disagreements, len(BY_WRITEBACK) * 2, out)

    out("\n== what each handout declares, and what it did")
    for handout_name in sorted(loaded):
        module = loaded[handout_name]
        modelled, _ = recut(handout_name, loaded)
        agrees = modelled["mutation_survives"] == module.MUTATION_SURVIVES
        out(f"    {'ok ' if agrees else 'NO '} {module.NAME:<18} says {module.HANDS_BACK}")
        out(f"    {'':4} {'':<18} mutation survives: declared "
            f"{module.MUTATION_SURVIVES}, measured {modelled['mutation_survives']}")

    out("\n== the numbers FMS declares, re-measured")
    declared, measured = ARCH["declared_and_then_remeasured"], upstream.structure()
    wrong = []
    for key, value in measured.items():
        agrees = declared.get(key) == value
        if not agrees:
            wrong.append(f"{key}: declared {declared.get(key)!r}, measured {value!r}")
        out(f"    {'ok ' if agrees else 'NO '} {key:<22} {value}")

    report.gaps(out)

    if "--strict" in argv and (wrong or (disagreements and policy.recut_must_match_upstream())):
        for line in wrong:
            out(f"\n  !! {line}")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
