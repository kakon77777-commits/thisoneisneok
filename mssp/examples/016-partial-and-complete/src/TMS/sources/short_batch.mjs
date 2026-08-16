// The control.
//
// It yields TWO records and finishes. `breaks-midway` also yields two records
// and then throws. Without this file, "two records" and "broke after two
// records" would be a single observation, and section 3 of the island test
// could not come out badly.
//
// Same role as the in-memory medium in example 011 and `archive-dump` in
// example 015: a case that produces the same number for the opposite reason.
export const NAME = "short-batch";
export const CAN_FAIL_WITH = ["stale-cursor"];

export function* records() {
  yield { from: NAME, id: "s-1" };
  yield { from: NAME, id: "s-2" };
}
