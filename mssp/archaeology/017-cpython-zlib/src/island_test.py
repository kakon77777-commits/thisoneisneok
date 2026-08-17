"""The island test, run against the real zlib.

    python src/island_test.py

Section 3 is the control. Section 3b is the drill: a reader that DECLARES it
reports completeness while returning only bytes must be caught by running it.
"""
import json
import pathlib
import re
import sys
import zlib

from SMS import upstream
from TMS.readers import incremental, one_shot

HERE = pathlib.Path(__file__).parent
FMS = json.loads((HERE / "FMS" / "architecture.json").read_text(encoding="utf-8"))
POLICY = json.loads((HERE / "SCL" / "policy.json").read_text(encoding="utf-8"))
FAILURES = []
RAN = [0]


def check(label, ok, detail=""):
    RAN[0] += 1
    print(f'  {"PASS" if ok else "FAIL"}  {label}{f" - {detail}" if detail else ""}')
    if not ok:
        FAILURES.append(label)


print(f"\n  {upstream.versions()}")
whole, trunc = upstream.compressed(), upstream.truncated_stream()

print("\n== 1. each reader is an island, and FMS matches the tree")
for unit, declared in FMS["units"].items():
    directory = HERE.joinpath(*unit.split("/"))
    on_disk = sorted(p.name for p in directory.glob("*.py") if p.name != "__init__.py")
    check(f"{unit}: FMS declares what is on disk", on_disk == sorted(declared),
          f'disk {", ".join(on_disk)} | FMS {", ".join(sorted(declared))}')
    for name in on_disk:
        body = directory.joinpath(name).read_text(encoding="utf-8")
        check(f"{unit}/{name} imports nothing at all",
              not re.search(r"^\s*(import|from)\s", body, re.M))
check("both readers declare what they raise and what they report",
      all(isinstance(m.RAISES_ON_TRUNCATION, bool) and isinstance(m.REPORTS_COMPLETENESS, bool)
          for m in (one_shot, incremental)))

print("\n== 2. the same truncated stream, two readers from one module")
shot = upstream.one_shot(trunc)
step = upstream.incremental(trunc)
check("zlib.decompress raises", shot["raised"] is not None, shot["raised"])
check("  and the message names truncation", "truncated" in (shot["raised"] or ""))
check("  and it returns no bytes at all", shot["bytes"] is None)
check("decompressobj does NOT raise", step["raised"] is None)
check("  and returns real bytes", step["bytes"] is not None and len(step["bytes"]) > 0,
      f'{len(step["bytes"] or b"")} bytes')
check("  and reports eof = False", step["eof"] is False)
check("on a complete stream both succeed",
      upstream.one_shot(whole)["raised"] is None and upstream.incremental(whole)["raised"] is None)
check("and only then is eof True", upstream.incremental(whole)["eof"] is True)

print("\n== 3. the control - a complete stream carrying exactly those bytes")
control = upstream.incremental(upstream.control_for(step["bytes"]))
check("the control stream is complete", control["eof"] is True)
check("it decompresses to the same number of bytes", len(control["bytes"]) == len(step["bytes"]),
      f'{len(control["bytes"])} vs {len(step["bytes"])}')
check("BYTE-IDENTICAL to the truncated read", control["bytes"] == step["bytes"])
check("so no returned value can tell them apart", not (control["bytes"] != step["bytes"]))
check("and .eof can", control["eof"] != step["eof"], f'{control["eof"]} vs {step["eof"]}')
check("which means the discriminator is on the object, not on the value",
      incremental.COMPLETENESS_LIVES_ON.startswith("the decompressor object"))

print("\n== 3b. DRILL - a reader that overclaims must be caught by running it")


def reports_completeness(read):
    """Run the reader on a truncated stream and see whether the result carries
    a completeness answer at all."""
    return read(trunc)["eof"] is not None


liar_declares = True  # a unit claiming decompressobj's flag while returning only bytes
check("the drill unit declares it reports completeness", liar_declares is True)
check("running it says otherwise", reports_completeness(upstream.one_shot) is False)
check("so the declaration is refused", reports_completeness(upstream.one_shot) != liar_declares)
check("and the honest declarations hold under the same probe",
      reports_completeness(upstream.incremental) is incremental.REPORTS_COMPLETENESS
      and reports_completeness(upstream.one_shot) is one_shot.REPORTS_COMPLETENESS)
check("the raise-on-truncation declarations hold too",
      (upstream.one_shot(trunc)["raised"] is not None) is one_shot.RAISES_ON_TRUNCATION
      and (upstream.incremental(trunc)["raised"] is not None) is incremental.RAISES_ON_TRUNCATION)

print("\n== 4. a deliberate partial read lands in the same state as an accidental one")
capped = upstream.incremental(whole, max_length=100)
check("max_length returns exactly the cap", len(capped["bytes"]) == 100)
check("with eof False", capped["eof"] is False)
check("and an unconsumed tail", capped["unconsumed"] > 0, f'{capped["unconsumed"]} bytes')
check("the accidental truncation has eof False as well", step["eof"] is False)
check("so eof alone does not say WHY, only that it is not finished",
      capped["eof"] == step["eof"] and capped["unconsumed"] != (step["unconsumed"] or 0))

print("\n== 5. the truncation cuts mid-record")
complete_records, trailing = upstream.whole_records(step["bytes"])
check("the caller collects whole records", len(complete_records) > 0, f"{len(complete_records)}")
check("and one trailing fragment", len(trailing) > 0, repr(trailing))
check("the fragment starts like a record", trailing.startswith(b"record-"))
check("and is shorter than one", len(trailing) < len(b"record-000"))
check("a complete payload leaves no fragment",
      upstream.whole_records(upstream.PAYLOAD)[1] == b"")

print("\n== 6. what this does not change")
check("the incremental reader is right not to raise - not-finished-yet is its normal state",
      upstream.incremental(whole[: len(whole) // 4])["raised"] is None)
check("feeding it the rest still finishes",
      zlib.decompressobj().decompress(whole)[-11:] == b"record-059\n")
check("SCL names the cost in words",
      "one attribute read" in POLICY["what_this_costs"].lower())
check("and this deployment does refuse", POLICY["a_stream_that_did_not_reach_eof_is"] == "fatal")

print()
if FAILURES:
    print(f'  {len(FAILURES)} FAILED: {" | ".join(FAILURES)}')
    sys.exit(1)
print(f"  {RAN[0]} checks passed - every probe ran the real zlib")
