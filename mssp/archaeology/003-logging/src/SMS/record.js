// One event, as a value.
//
// Upstream this is LogRecord, and it is the piece that makes the four axes
// possible: the thing that happened is separated from where it goes, how it
// reads, and whether it goes at all. A Logger creates one, a Filter inspects
// one, a Formatter renders one, a Handler delivers one — and none of them has
// to know what the others did.

export const LEVELS = { debug: 10, info: 20, warning: 30, error: 40 };

export function makeRecord(logger, level, message, extra = {}) {
  if (!(level in LEVELS)) throw new Error(`unknown level: ${level}`);
  return { logger, level, severity: LEVELS[level], message, extra, at: 0 };
}
