// import statements must come before other statements.
//
// Imports nothing — not even the registry that loads it.

// Per-run state, cleared by reset(). A rule that carries state between files
// and does not say so is the shape archaeology 003 found in logging.
let sawStatement = false;

export const rule = {
  id: "rules/first",
  description: "imports must come first",
  reset() {
    sawStatement = false;
  },
  check(text, line) {
    const trimmed = text.trim();
    if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("/*")) return null;
    if (!trimmed.startsWith("import ")) {
      sawStatement = true;
      return null;
    }
    if (!sawStatement) return null;
    return { line, id: "rules/first", message: "import appears after a statement" };
  },
};
