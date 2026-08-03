// The loop. Records in, one outcome per record per transform out.
//
// It imports no transform. It is handed a list, which is what lets the island
// test hand it exactly one.

import { assertMayDrop, PermissionError } from "../SCL/policy.js";
import { DROPPED, FAILED, outcome, UNCHANGED } from "./model.js";
import { reconcile } from "./reconcile.js";

/**
 * @param records   the input, in full
 * @param transforms  each publishing { name, applies(record), apply(record) }
 */
export function migrate(records, transforms) {
  const outcomes = [];
  // Counted here rather than derived from outcomes later: a transform that is
  // never invoked produces no outcome to count, and "never invoked" is the
  // fact this example exists to surface.
  const invocations = Object.fromEntries(transforms.map((t) => [t.name, 0]));
  const declines = Object.fromEntries(transforms.map((t) => [t.name, 0]));

  for (const record of records) {
    let current = record;
    let touched = false;

    for (const transform of transforms) {
      if (!transform.applies(current)) {
        declines[transform.name] += 1;
        continue;
      }
      invocations[transform.name] += 1;

      let result;
      try {
        result = transform.apply(current);
      } catch (error) {
        outcomes.push(outcome(FAILED, {
          by: transform.name, id: current.id, before: current, reason: String(error.message),
        }));
        touched = true;
        break;
      }

      if (result.kind === DROPPED) {
        try {
          assertMayDrop(transform.name);
        } catch (error) {
          if (!(error instanceof PermissionError)) throw error;
          // A refused drop is a failure of the transform, not of the record.
          outcomes.push(outcome(FAILED, {
            by: transform.name, id: current.id, before: current, reason: error.message,
          }));
          touched = true;
          break;
        }
      }

      outcomes.push(result);
      touched = true;
      if (result.kind === DROPPED) break;
      current = result.after;
    }

    // A record no transform claimed still has to appear in the ledger, or the
    // arithmetic will not balance and the run cannot be trusted.
    if (!touched) {
      outcomes.push(outcome(UNCHANGED, {
        by: "(none)", id: record.id, before: record, reason: "no transform applied to it",
      }));
    }
  }

  return { outcomes, invocations, declines, reconciliation: reconcile(records.length, outcomes) };
}
