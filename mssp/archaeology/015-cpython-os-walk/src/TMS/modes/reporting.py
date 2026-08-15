"""os.walk with an onerror callback.

The same traversal, the same files, and one difference: somebody is told. The
files that come back are identical either way, which is the whole finding.
"""
NAME = "reporting"
REPORTS_ERRORS = True
WHAT_THE_CALLER_SEES = "the same list, plus the errors that shortened it"


def make_collector(into):
    return lambda error: into.append(f"{type(error).__name__} on {error.filename}")
