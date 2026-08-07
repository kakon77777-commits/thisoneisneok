"""The island test, and the live measurement of CPython's json accelerator.

    python src/island_test.py

Section 4 is the one that produced this entry: it turns _json off, proves the
switch actually happened, and then asks what changed.
"""
import importlib
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE))

from DMS import equivalence  # noqa: E402
from SCL import policy  # noqa: E402
from SMS import drive, select  # noqa: E402

FAILURES = []


def report(label, ok, detail=""):
    print(f"  {'PASS' if ok else 'FAIL'}  {label}{' - ' + detail if detail else ''}")
    if not ok:
        FAILURES.append(label)


print("\n== 1. each implementation is an island")
for name in ("fast", "plain"):
    module = importlib.import_module(f"TMS.impl.{name}")
    source = (HERE / "TMS" / "impl" / f"{name}.py").read_text(encoding="utf-8")
    report(f"impl/{name} escapes with no sibling loaded", module.escape('a"b') == 'a\\"b',
           module.escape('a"b'))
    report(f"impl/{name} imports nothing", "import " not in source)

print("\n== 2. the selection is a value, not a name bound at import time")
report("both implementations are available", len(select.available()) == 2,
       ", ".join(select.available()))
fast_name, _ = select.choose(prefer_fast=True, allowed=True)
plain_name, _ = select.choose(prefer_fast=False, allowed=True)
refused_name, _ = select.choose(prefer_fast=True, allowed=False)
report("preferring the accelerator selects it", fast_name == "impl/fast")
report("not preferring it selects the other", plain_name == "impl/plain")
report("SCL refusing it selects the other too", refused_name == "impl/plain",
       "upstream has no equivalent switch — the choice is made by what is installed")

print("\n== 3. the comparison refuses to compare something with itself")
{
}
findings = equivalence.compare(
    {}, ["x"], "impl/fast", drive.run(importlib.import_module("TMS.impl.fast"), ["x"]),
    "impl/fast", drive.run(importlib.import_module("TMS.impl.fast"), ["x"]))
report("comparing an implementation with itself finds no difference",
       findings["identical_values"] == 1 and not findings["differing_values"],
       "which is why main.py refuses to report it as an equivalence result")
main_source = (HERE / "main.py").read_text(encoding="utf-8")
report("and main.py has that refusal in code, not in prose",
       "REFUSING to report an equivalence" in main_source
       and "if fast_name == plain_name:" in main_source)

print("\n== 4. measured against CPython json 3.14.5 itself")
import json  # noqa: E402
import json.decoder  # noqa: E402
import json.encoder  # noqa: E402
import json.scanner  # noqa: E402

report("this interpreter is the examined version", sys.version.split()[0] == "3.14.5",
       sys.version.split()[0])
report("the C accelerator is present", importlib.util.find_spec("_json") is not None)

CORPUS = [{"a": 1, "b": [1, 2, {"c": None}]}, {"u": "héllo — 中文"}, [], {},
          {"n": [1.5, -0.0, 1e300]}, {"k": True, "l": None}]
BAD = ['{"a": }', '[1,]', '{"a" 1}', '"unterminated', '{1: 2}', '[1 2]', 'nul',
       '{"a": 1', '[', '1.', '"\\x"', '{"a": 01}']


def snapshot():
    decoder = json.decoder.JSONDecoder()
    encoder = json.encoder.JSONEncoder(sort_keys=True)
    values = [encoder.encode(obj) for obj in CORPUS]
    values += [repr(decoder.decode(encoder.encode(obj))) for obj in CORPUS]
    errors = []
    for text in BAD:
        try:
            decoder.decode(text)
            errors.append((text, None, "accepted"))
        except Exception as exc:  # noqa: BLE001
            errors.append((text, type(exc).__name__, str(exc)))
    return values, errors, type(decoder.scan_once).__module__


c_values, c_errors, c_scanner = snapshot()

# Setting c_make_scanner alone does NOT switch the decoder: json/scanner.py runs
# `make_scanner = c_make_scanner or py_make_scanner` at import time, so the name
# is already bound. My first measurement did exactly this and compared C with C.
json.scanner.c_make_scanner = None
_, _, still = snapshot()
report("clearing c_make_scanner alone does not switch the scanner", still == c_scanner,
       f"still {still} — the `or` already ran at import time")

json.scanner.make_scanner = json.scanner.py_make_scanner
json.encoder.c_make_encoder = None
json.decoder.scanstring = json.decoder.py_scanstring
json.encoder.encode_basestring_ascii = json.encoder.py_encode_basestring_ascii
json.encoder.encode_basestring = json.encoder.py_encode_basestring
py_values, py_errors, py_scanner = snapshot()

report("rebinding make_scanner does switch it", py_scanner != c_scanner,
       f"{c_scanner} -> {py_scanner}")
report("values are byte-identical with and without the accelerator",
       c_values == py_values, f"{len(c_values)} strings compared")

same_class = [c for c, p in zip(c_errors, py_errors) if c[1] == p[1]]
text_differs = [(c[0], c[2], p[2]) for c, p in zip(c_errors, py_errors) if c[1] == p[1] and c[2] != p[2]]
report("every input is accepted or rejected the same way",
       len(same_class) == len(BAD), f"{len(same_class)} of {len(BAD)} same error class")
report("and exactly one error MESSAGE differs", len(text_differs) == 1,
       "; ".join(f"{t!r}" for t, _, _ in text_differs))
for text, c, p in text_differs:
    print(f"        C : {c}")
    print(f"        py: {p}")
report("so 'the accelerator is not structural' is true only under a stated witness",
       c_values == py_values and len(text_differs) == 1,
       "same value: not structural. same message: observable.")

print("\n== 5. the checks can fail")
report("a comparison of two DIFFERENT implementations does find the difference",
       len(equivalence.compare({}, [42], "a", drive.run(importlib.import_module("TMS.impl.fast"), [42]),
                               "b", drive.run(importlib.import_module("TMS.impl.plain"), [42]))
           ["differing_error_text"]) == 1,
       "evaluated, not asserted")
report("the contract clause for error text can be made binding",
       any("MAY differ" not in label for label, _, _ in
           equivalence.verdict({}, {"differing_values": [], "identical_values": 0,
                                    "same_error_class": 0, "differing_error_class": [],
                                    "acceptance_differs": [], "differing_error_text": [("x", "a", "b")]},
                               True)),
       "policy.error_text_must_match() would turn today's pass into a failure")
report("this deployment does not require matching text", not policy.error_text_must_match())

print()
if FAILURES:
    print(f"  {len(FAILURES)} check(s) failed: {', '.join(FAILURES)}")
    raise SystemExit(1)
print("  island test passed")
