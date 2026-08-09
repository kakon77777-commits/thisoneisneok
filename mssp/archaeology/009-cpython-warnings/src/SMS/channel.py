"""The channel, with its memory made explicit.

CPython keeps this in a module-global `__warningregistry__` keyed by
(text, category, lineno), invalidated whenever the filter list is mutated. That
is efficient and it is invisible: nothing in the caller's view says "this notice
has a memory, and something you did earlier reset it".

Here the memory is a field on the channel, and clearing it is an operation with
an actor.
"""


class Channel:
    def __init__(self):
        self.delivered = []        # what a listener actually received
        self.attempted = []        # every send, whether delivered or not
        self._seen = set()
        self.clears = []

    def send(self, source, text):
        """Deliver a notice once per (source, text) until the memory is cleared."""
        self.attempted.append((source, text))
        key = (source, text)
        if key in self._seen:
            return False
        self._seen.add(key)
        self.delivered.append((source, text))
        return True

    def clear_memory(self, actor, may_clear):
        """Forget what has been delivered. Refused unless policy allows it."""
        if not may_clear(actor):
            self.clears.append((actor, "refused"))
            return False
        self._seen.clear()
        self.clears.append((actor, "cleared"))
        return True

    def suppressed(self):
        return len(self.attempted) - len(self.delivered)
