// A source that declared itself incomplete is dropped from the export.
//
// Defensible: a compliance export may be smaller than expected but may not be
// quietly partial, so anything known-partial is excluded and named.
export const POLICY = "refuse-declared";
export const WHAT_IT_DOES_WITH_A_DECLARATION = "drops the source";

export function apply(runs) {
  return runs.map((run) => (run.incomplete_because
    ? { ...run, kept: [], note: `dropped: ${run.incomplete_because}` }
    : { ...run, kept: run.records, note: null }));
}
