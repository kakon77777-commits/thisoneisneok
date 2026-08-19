// Holds six records, hands over three per unit of budget, and SAYS SO.
//
// This is the unit example 017 called self-penalising. Whether that is true is
// what this example measures rather than assumes.
export const NAME = "honest-page";
export const CAN_FAIL_WITH = ["unreadable-page", "cursor-expired"];
export const HELD = 6;

export function collect({ budget = 1 } = {}) {
  const take = Math.min(HELD, budget * 3);
  return {
    records: Array.from({ length: take }, (_, n) => ({ from: NAME, id: `h-${n + 1}` })),
    incomplete_because: take < HELD ? "more-after-cursor" : null,
  };
}
