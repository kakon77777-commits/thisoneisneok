"""The default. Compares the header's two fields against the source file's metadata.

Upstream this is `_validate_timestamp_pyc`, 26 lines, and it reads the source
file's stat - never its contents. That is the whole point of it: it is fast
because it does not open the source.
"""
MODE = "TIMESTAMP"
FLAGS = 0
READS = ["source mtime, low 32 bits", "source size"]
ABOUT = "the file's metadata"
UNCONDITIONAL = False


def is_fresh(header, observed):
    if header["field2"] != (observed["mtime"] & 0xFFFFFFFF):
        return False
    return header["field3"] == observed["size"]
