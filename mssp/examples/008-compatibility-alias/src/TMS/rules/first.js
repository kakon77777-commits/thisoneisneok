// import statements must come before other statements. Imports nothing.
let sawStatement = false;

export const rule = {
  id: "rules/first",
  meta: { category: "order", description: "imports must come first" },
  reset() { sawStatement = false; },
  check(text, line) {
    const trimmed = text.trim();
    if (!trimmed || trimmed.startsWith("//")) return null;
    if (!trimmed.startsWith("import ")) { sawStatement = true; return null; }
    return sawStatement ? { line, message: "import appears after a statement" } : null;
  },
};
