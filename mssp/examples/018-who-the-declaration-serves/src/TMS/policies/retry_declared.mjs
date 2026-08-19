// A source that declared itself incomplete is run again with a larger budget.
//
// Defensible, and common: the declaration is exactly the signal that spending
// more on this source will yield more. Nothing here is a strawman.
export const POLICY = "retry-declared";
export const WHAT_IT_DOES_WITH_A_DECLARATION = "re-runs the source with more budget";
export const RETRY_BUDGET = 2;

export function apply(runs, rerun) {
  return runs.map((run) => {
    if (!run.incomplete_because) return { ...run, kept: run.records, note: null };
    const second = rerun(run.source, RETRY_BUDGET);
    return { ...run, kept: second.records, note: `re-run at budget ${RETRY_BUDGET}` };
  });
}
