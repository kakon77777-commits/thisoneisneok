// The control, and the comparison the whole example turns on.
//
// It holds exactly what honest-page holds and hands over exactly as much per
// unit of budget. The ONLY difference between the two units is that this one
// never declares. So any difference in what they end up contributing is
// attributable to the declaration and to nothing else.
export const NAME = "silent-page";
export const CAN_FAIL_WITH = ["unreadable-page", "cursor-expired"];
export const HELD = 6;

export function collect({ budget = 1 } = {}) {
  const take = Math.min(HELD, budget * 3);
  return {
    records: Array.from({ length: take }, (_, n) => ({ from: NAME, id: `s-${n + 1}` })),
    incomplete_because: null,
  };
}
