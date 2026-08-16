// A source that yields everything it has and finishes.
//
// It reaches no sibling set and no sibling source. It knows nothing about
// how its records will be combined with anyone else's.
export const NAME = "full-batch";
export const CAN_FAIL_WITH = ["unreadable-page"];

export function* records() {
  yield { from: NAME, id: "f-1" };
  yield { from: NAME, id: "f-2" };
  yield { from: NAME, id: "f-3" };
}
