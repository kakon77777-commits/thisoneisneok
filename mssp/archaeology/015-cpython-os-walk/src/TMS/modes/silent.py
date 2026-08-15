"""os.walk's default: onerror=None.

An error during the traversal is discarded. The walk continues, the caller gets
a result that looks complete, and nothing anywhere says a directory was skipped.
"""
NAME = "silent"
ONERROR = None
REPORTS_ERRORS = False
WHAT_THE_CALLER_SEES = "a shorter list, indistinguishable from a smaller tree"
