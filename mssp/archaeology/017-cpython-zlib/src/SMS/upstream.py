"""Probes that run the real zlib. Nothing here is simulated.

The payload is deliberately line-oriented, because the thing a caller does with
a decompressed blob is split it, and the split is where the evidence dies.
"""
import zlib

PAYLOAD = b"".join(b"record-%03d\n" % n for n in range(60))


def versions():
    return f"zlib {zlib.ZLIB_VERSION} (runtime {zlib.ZLIB_RUNTIME_VERSION})"


def compressed():
    return zlib.compress(PAYLOAD, 9)


def truncated_stream():
    """Half a valid stream. A dropped connection produces exactly this."""
    whole = compressed()
    return whole[: len(whole) // 2]


def one_shot(data):
    """zlib.decompress — the function everybody reaches for."""
    try:
        return {"bytes": zlib.decompress(data), "raised": None, "eof": None}
    except zlib.error as raised:
        return {"bytes": None, "raised": str(raised), "eof": None}


def incremental(data, max_length=None):
    """decompressobj — the streaming path, and the one with a completeness flag."""
    decompressor = zlib.decompressobj()
    try:
        out = (decompressor.decompress(data) if max_length is None
               else decompressor.decompress(data, max_length))
    except zlib.error as raised:
        return {"bytes": None, "raised": str(raised), "eof": None, "unconsumed": None}
    return {"bytes": out, "raised": None, "eof": decompressor.eof,
            "unconsumed": len(decompressor.unconsumed_tail)}


def control_for(output):
    """A COMPLETE stream whose payload is exactly `output`.

    This is what makes the entry able to say anything: without it, "the
    truncated read returned 218 bytes" is not evidence that a truncated read is
    indistinguishable from an honest short one.
    """
    return zlib.compress(output, 9)


def whole_records(data):
    """What a caller gets after the idiomatic split."""
    lines = data.split(b"\n")
    complete = [line for line in lines[:-1]]
    trailing = lines[-1]
    return complete, trailing
