"""zlib.decompress, wrapped as a declaring unit.

It cannot report completeness because it has nowhere to report it from — it
returns bytes and nothing else. What it does instead is refuse: a truncated
stream raises. The declaration is verified by running it, not by reading here.
"""
READER = "zlib.decompress"
RAISES_ON_TRUNCATION = True
REPORTS_COMPLETENESS = False
