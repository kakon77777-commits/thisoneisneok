// Combine by keeping every record and keeping each source's outcome beside it.
//
// This is what `Promise.allSettled` does. It keeps the partial work, which is
// only safe because every record carries `from` — without that, the two
// records from a source that did not finish are anonymous in the pile.
export const COMBINER = "settle-each";
export const KEEPS_PARTIAL_WORK = true;

export function combine(runs) {
  return { records: runs.flatMap((run) => run.records), discarded: 0, refused: null };
}
