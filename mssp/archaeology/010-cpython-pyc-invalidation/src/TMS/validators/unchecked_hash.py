"""The header carries a hash and nothing ever compares it.

This is not an oversight. It is for deployments where a build system already
guarantees the .pyc matches, and paying to read every source file at import
time buys nothing. The hash is still recorded so a tool outside the import
system can check it later.

A validator that can never refuse is allowed. What makes this one legitimate
rather than broken is that the refusal to check is declared in the header's own
flag bits, where anything can read it.
"""
MODE = "UNCHECKED_HASH"
FLAGS = 1
READS = []
ABOUT = "the file's bytes, as of whenever the cache was written"
UNCONDITIONAL = True


def is_fresh(header, observed):
    return True
