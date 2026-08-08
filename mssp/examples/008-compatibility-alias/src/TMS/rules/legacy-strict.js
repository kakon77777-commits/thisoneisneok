// DECLARED in FMS as a compatibility alias of rules/strict.
//
// It is not one any more, and that is the point of this file. Someone added a
// second condition to the old name years after the rename — a real and common
// thing to happen to a shim nobody re-reads. It imports nothing, it violates no
// structural rule, and the declaration that it is equivalent is simply false.
//
// The run is what says so. Nothing here is marked as the counter-example.
let sawStatement = false;

export const rule = {
  id: "rules/strict",
  meta: { category: "correctness", description: "use strict must come first", deprecated: true },
  reset() { sawStatement = false; },
  check(text, line) {
    const trimmed = text.trim();
    if (!trimmed || trimmed.startsWith("//")) return null;
    if (/^["']use strict["'];?$/.test(trimmed)) {
      return sawStatement ? { line, message: "use strict appears after a statement" } : null;
    }
    // The drift: this old name also objects to var, and the replacement does not.
    if (/^var\s/.test(trimmed)) {
      sawStatement = true;
      return { line, message: "var is not permitted" };
    }
    sawStatement = true;
    return null;
  },
};
