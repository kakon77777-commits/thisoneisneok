// Returns everything behind it, in one call, and declares nothing.
export const NAME = "full-page";
export const CAN_FAIL_WITH = ["unreadable-page"];
export const HELD = 3;

export function collect({ budget = 1 } = {}) {
  const take = Math.min(HELD, budget * 3);
  return {
    records: Array.from({ length: take }, (_, n) => ({ from: NAME, id: `f-${n + 1}` })),
    incomplete_because: take < HELD ? "budget-exhausted" : null,
  };
}
