// Promise.all, wrapped as a declaring unit.
//
// It declares that it does NOT keep what succeeded. The declaration is checked
// by running it (island test section 3b), not by reading this line.
export const COMBINATOR = "Promise.all";
export const KEEPS_WHAT_SUCCEEDED = false;
export const REASONS_SURFACED = 1;

export async function combine(promises) {
  try {
    return { kept: await Promise.all(promises), reasons: [] };
  } catch (raised) {
    return { kept: [], reasons: [raised.message] };
  }
}
