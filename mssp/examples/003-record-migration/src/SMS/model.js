// The shapes every set agrees on.
//
// `Outcome` is the one worth looking at. A transform returns one of four
// things, and `unchanged` is a distinct answer from `applied` on purpose: a
// migration where every transform declines every record is a legitimate,
// successful, completely useless run, and the report has to be able to say so.

export const APPLIED = "applied";
export const UNCHANGED = "unchanged";
export const DROPPED = "dropped";
export const FAILED = "failed";

export const OUTCOMES = [APPLIED, UNCHANGED, DROPPED, FAILED];

/** One record, before anything touches it. */
export function record(id, fields) {
  return { id, fields: { ...fields } };
}

/**
 * What one transform did to one record.
 *
 * `before` and `after` are carried even when nothing changed, because the
 * witness sample in DMS needs a reader to be able to see that nothing changed
 * — "unchanged" asserted without the pair is the same shape of claim this
 * example exists to argue against.
 */
export function outcome(kind, { by, id, before, after = before, reason = "" }) {
  if (!OUTCOMES.includes(kind)) throw new Error(`unknown outcome: ${kind}`);
  return { kind, by, id, before, after, reason };
}
