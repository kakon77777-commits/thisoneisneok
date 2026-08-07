"""The identity test, run rather than asserted.

MSSP states it in words: remove it, and is the system still itself? Mechanising
that turned out to need two things I did not expect.

**Substitution, not deletion.** Deleting an imported module raises ImportError,
so every module the entry point imports looks structural. Deletion measures
reachability. Each rostered module is therefore replaced with a stub in
DMS/stubs/ that keeps the signature and does nothing meaningful — and writing
that stub is itself the act of saying what the module would be if it did not
matter.

**A witness for the answer.** "Still itself" needs someone to say what the
program is FOR. FMS declares it: the answer is present when the output names
every id that differs or is unmatched. A machine can check that. A machine
cannot decide it.
"""
import pathlib
import shutil
import subprocess
import sys
import tempfile


def run(src_dir, manifest, baseline_output):
    roster = manifest["sms_roster"]
    witness = manifest["answer_witness"]
    stubs = pathlib.Path(__file__).parent / "stubs"
    results = []

    for module in roster:
        stub = stubs / f"{module}.py"
        if not stub.exists():
            results.append({"module": module, "verdict": "NO STUB",
                            "detail": f"write DMS/stubs/{module}.py — the test cannot run without it"})
            continue

        with tempfile.TemporaryDirectory() as tmp:
            copy = pathlib.Path(tmp) / "src"
            shutil.copytree(src_dir, copy, ignore=shutil.ignore_patterns("__pycache__"))
            shutil.copyfile(stub, copy / "SMS" / f"{module}.py")

            proc = subprocess.run([sys.executable, str(copy / "main.py")],
                                  capture_output=True, text=True, timeout=60)

        if proc.returncode != 0:
            last = [line for line in proc.stderr.strip().split("\n") if line.strip()]
            results.append({"module": module, "verdict": "structural",
                            "detail": f"cannot run: {last[-1][:64] if last else 'no stderr'}"})
            continue

        missing = [i for i in witness["ids"] if i not in proc.stdout]
        if missing:
            results.append({"module": module, "verdict": "structural",
                            "detail": f"runs, but the answer is gone: missing {', '.join(missing)}"})
        elif proc.stdout == baseline_output:
            results.append({"module": module, "verdict": "NOT STRUCTURAL",
                            "detail": "answer intact, and the output did not even change"})
        else:
            results.append({"module": module, "verdict": "NOT STRUCTURAL",
                            "detail": "answer intact, output differs — presentation, not structure"})
    return results


def render(results, manifest):
    roster = manifest["sms_roster"]
    lines = ["", "== identity test: replace with a stub, then ask if the answer survived"]
    lines.append(f"   the answer is: {manifest['answer_witness']['what_the_program_is_for']}")
    lines.append(f"   present when:  {manifest['answer_witness']['present_when']}")
    lines.append("")
    for record in results:
        mark = "ok " if record["verdict"] == "structural" else "!! "
        lines.append(f"  {mark} {record['module']:<14} {record['verdict']:<16} {record['detail']}")

    structural = [r["module"] for r in results if r["verdict"] == "structural"]
    other = [r["module"] for r in results if r["verdict"] != "structural"]
    lines.append("")
    lines.append(f"  claimed SMS        {len(roster)}")
    lines.append(f"  survives the test  {len(structural)}  {', '.join(structural)}")
    lines.append(f"  does not           {len(other)}  {', '.join(other) if other else 'none'}")
    lines.append("")
    lines.append("  the size of SMS is a RESULT here, not a budget anyone chose")
    return "\n".join(lines) + "\n"
