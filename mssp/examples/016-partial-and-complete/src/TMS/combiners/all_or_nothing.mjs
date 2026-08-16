// Combine by refusing the whole batch if any source did not finish.
//
// This is what `Promise.all` does, and archaeology 016 measures its cost:
// the records that already arrived are discarded, and the work that produced
// them ran to completion anyway.
export const COMBINER = "all-or-nothing";
export const KEEPS_PARTIAL_WORK = false;

export function combine(runs) {
  const broken = runs.find((run) => run.outcome === "partial" || run.outcome === "failed");
  if (!broken) return { records: runs.flatMap((run) => run.records), discarded: 0, refused: null };
  return {
    records: [],
    discarded: runs.reduce((n, run) => n + run.records.length, 0),
    refused: `${broken.source} (${broken.outcome}): ${broken.error}`,
  };
}
