"""PEP 552. The two header fields hold an eight-byte hash of the source bytes.

Upstream this is `_validate_hash_pyc`, 22 lines, and it is four lines shorter
than the timestamp validator while answering a strictly harder question. The
cost is not in the comparison - it is that somebody had to read the source file
to compute the hash to compare against.
"""
MODE = "CHECKED_HASH"
FLAGS = 3
READS = ["an 8-byte hash of the source bytes"]
ABOUT = "the file's bytes"
UNCONDITIONAL = False


def is_fresh(header, observed):
    return (header["field2"], header["field3"]) == observed["hash"]
