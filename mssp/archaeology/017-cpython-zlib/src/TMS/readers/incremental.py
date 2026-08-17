"""decompressobj().decompress, wrapped as a declaring unit.

It does not raise on a truncated stream — it cannot, because "not finished yet"
is its normal state between calls. It reports completeness instead, on `.eof`.

The catch, which is the whole entry: `.eof` is on the OBJECT and the bytes are
the VALUE. The moment the bytes leave the decompressor the flag does not go
with them.
"""
READER = "decompressobj"
RAISES_ON_TRUNCATION = False
REPORTS_COMPLETENESS = True
COMPLETENESS_LIVES_ON = "the decompressor object, not the returned bytes"
