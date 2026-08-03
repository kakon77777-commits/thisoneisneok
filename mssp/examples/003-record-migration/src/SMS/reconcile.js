// The arithmetic that has to balance.
//
// This is core, not reporting. "0 errors" is a claim about one bucket; whether
// the buckets add up to the input is a claim about whether the loop visited
// everything it was given. A run can have zero failures and still have lost
// records — by an early return, a filter applied before counting, a transform
// that threw somewhere the counter did not reach.
//
// Reconciliation belongs in SMS because the pipeline cannot honestly report a
// result without it. DMS renders the answer; it does not decide it.

import { OUTCOMES } from "./model.js";

export function tally(outcomes) {
  const counts = Object.fromEntries(OUTCOMES.map((kind) => [kind, 0]));
  for (const item of outcomes) counts[item.kind] += 1;
  return counts;
}

/**
 * Does the ledger account for every record that went in?
 *
 * Returns the discrepancy rather than a boolean: a caller that only learns
 * "unbalanced" has to go and find out by how much, and the difference is the
 * first thing anyone asks.
 */
export function reconcile(inputCount, outcomes) {
  const counts = tally(outcomes);
  const accounted = OUTCOMES.reduce((sum, kind) => sum + counts[kind], 0);

  // Every record must appear exactly once, so a duplicated id is as wrong as a
  // missing one even when the totals happen to agree.
  const seen = new Map();
  for (const item of outcomes) seen.set(item.id, (seen.get(item.id) ?? 0) + 1);
  const duplicated = [...seen.entries()].filter(([, n]) => n > 1).map(([id]) => id);

  return {
    input: inputCount,
    accounted,
    counts,
    missing: inputCount - accounted,
    duplicated,
    balanced: accounted === inputCount && duplicated.length === 0,
  };
}
