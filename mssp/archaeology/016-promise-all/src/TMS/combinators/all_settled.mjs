// Promise.allSettled, wrapped as a declaring unit.
//
// The outcome travels with each item — `{status, value}` or `{status, reason}` —
// which is why it can keep the fulfilled values without them going anonymous.
export const COMBINATOR = "Promise.allSettled";
export const KEEPS_WHAT_SUCCEEDED = true;
export const REASONS_SURFACED = Infinity;

export async function combine(promises) {
  const results = await Promise.allSettled(promises);
  return {
    kept: results.filter((r) => r.status === "fulfilled").map((r) => r.value),
    reasons: results.filter((r) => r.status === "rejected").map((r) => r.reason.message),
  };
}
