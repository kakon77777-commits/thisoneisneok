"""One truncated stream, two readers from the same module.

    python src/main.py            what each reader returns and what it lets you ask
    python src/main.py --strict   exit 1 if this deployment read a stream that never reached eof
"""
import json
import pathlib
import sys

from DMS import report
from SMS import upstream
from TMS.readers import incremental, one_shot

POLICY = json.loads((pathlib.Path(__file__).parent / "SCL" / "policy.json").read_text(encoding="utf-8"))
READERS = {module.READER: module for module in (one_shot, incremental)}


def main(argv):
    whole, trunc = upstream.compressed(), upstream.truncated_stream()
    print(f"\n  {upstream.versions()}")
    print(f'  {POLICY["deployment"]}: read with {POLICY["reader"]}\n')
    print(f"  payload {len(upstream.PAYLOAD)} bytes -> {len(whole)} compressed, "
          f"truncated to {len(trunc)}\n")

    rows = [
        {"stream": "truncated", "reader": "zlib.decompress", **upstream.one_shot(trunc)},
        {"stream": "truncated", "reader": "decompressobj", **upstream.incremental(trunc)},
        {"stream": "complete", "reader": "zlib.decompress", **upstream.one_shot(whole)},
        {"stream": "complete", "reader": "decompressobj", **upstream.incremental(whole)},
    ]
    print(report.reads(rows))
    print("\n  Same input. One refuses, the other returns a prefix and says nothing.\n")

    partial = upstream.incremental(trunc)
    control = upstream.incremental(upstream.control_for(partial["bytes"]))
    print("  the control - a COMPLETE stream carrying exactly those bytes:")
    print(report.identity(partial, control))
    print("\n  The only field that separates them is .eof, and it is on the decompressor,")
    print("  not on the bytes. A function that returns the bytes has thrown it away.\n")

    capped = upstream.incremental(whole, max_length=100)
    print(f'  decompress(complete, max_length=100) -> {len(capped["bytes"])} bytes, '
          f'eof = {capped["eof"]}, unconsumed_tail = {capped["unconsumed"]}')
    print("  a deliberate partial read lands in the same state as an accidental one\n")

    complete_records, trailing = upstream.whole_records(partial["bytes"])
    print("  what the idiomatic split leaves the caller:")
    print(report.after_the_split(complete_records, trailing))

    if "--strict" in argv and partial["eof"] is False \
            and POLICY["a_stream_that_did_not_reach_eof_is"] == "fatal":
        print(f'\n  --strict: the stream never reached eof and this deployment calls that fatal')
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
