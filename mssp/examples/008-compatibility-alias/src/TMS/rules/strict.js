// A file must declare "use strict" before any statement. Imports nothing.
let sawStatement = false;

export const rule = {
  id: "rules/strict",
  meta: { category: "correctness", description: "use strict must come first" },
  reset() { sawStatement = false; },
  check(text, line) {
    const trimmed = text.trim();
    if (!trimmed || trimmed.startsWith("//")) return null;
    if (/^["']use strict["'];?$/.test(trimmed)) {
      return sawStatement ? { line, message: "use strict appears after a statement" } : null;
    }
    sawStatement = true;
    return null;
  },
};
