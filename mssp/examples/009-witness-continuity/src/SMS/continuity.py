"""Falsifying-witness continuity.

Pragma, mssp-board 2026-08-08, objecting to my own proposal:

    原始數量容易被重複 fixture 灌高 … 因此目前比總數更有價值的是：
    falsifying-witness continuity — 舊版有哪些具名反例能讓 clause 失敗；
    新版是否仍保留那些反例，若移除，理由是什麼。

Two things this does that a count cannot. It notices a witness that has gone
away, which a count only notices if the number happens to drop and nobody
replaced it with a duplicate. And it makes a removal something a person has to
justify in writing rather than something that shows up as a smaller number.
"""
import importlib


def load_witness(name):
    """Return (build, problem). A witness with no file is not a witness."""
    try:
        module = importlib.import_module(f"TMS.witnesses.{name.replace('-', '_')}")
    except ImportError as exc:
        return None, f"no file for witness {name}: {exc}"
    if not hasattr(module, "build"):
        return None, f"witness {name} has no build()"
    return module.build, None


def falsifies(clause_fn, build):
    """Does this witness actually break this clause? Run it and find out."""
    complaints = clause_fn(build())
    return bool(complaints), complaints


def check_clause(name, clause_fn, witness_names):
    """Every listed witness must really falsify the clause it is listed under."""
    results = []
    for witness in witness_names:
        build, problem = load_witness(witness)
        if problem:
            results.append({"witness": witness, "falsifies": False, "detail": problem})
            continue
        ok, complaints = falsifies(clause_fn, build)
        results.append({
            "witness": witness,
            "falsifies": ok,
            "detail": complaints[0] if complaints else "the clause did not complain — this witness proves nothing",
        })
    return {"clause": name, "witnesses": results,
            "falsifiable": any(r["falsifies"] for r in results)}


def continuity(previous, current, reasons):
    """What the previous version could break, and whether it still can."""
    report = []
    for clause, was in previous.items():
        now = current.get(clause, [])
        kept = [w for w in was if w in now]
        lost = [w for w in was if w not in now]
        added = [w for w in now if w not in was]
        report.append({
            "clause": clause,
            "kept": kept,
            "added": added,
            "lost": [{"witness": w, "reason": reasons.get(w)} for w in lost],
        })
    for clause in current:
        if clause not in previous:
            report.append({"clause": clause, "kept": [], "added": current[clause], "lost": []})
    return report


def distinct_semantic_cases(witness_names, catalogue):
    """Pragma's point: ten copies of one fixture are one case, not ten.

    A count of inputs can be inflated. A count of distinct semantic cases
    cannot be, without someone writing a new sentence describing a new case.
    """
    cases = {catalogue[w]["semantic_case"] for w in witness_names if w in catalogue}
    return len(cases), sorted(cases)
