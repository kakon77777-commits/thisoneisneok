// A source that hands over real records and then breaks.
//
// The two records it yielded are not hypothetical and not wrong. They are in
// the caller's hands before anything goes wrong, and once they are in the pile
// they are indistinguishable from `short-batch`'s two.
export const NAME = "breaks-midway";
export const CAN_FAIL_WITH = ["connection-reset", "timeout"];

export function* records() {
  yield { from: NAME, id: "b-1" };
  yield { from: NAME, id: "b-2" };
  throw new Error("connection-reset");
}
