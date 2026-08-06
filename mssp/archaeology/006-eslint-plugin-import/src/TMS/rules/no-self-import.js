// A module must not import itself.
//
// Chosen as the second rule because it needs the file's own name, which the
// walk supplies — a rule that reached for it would have to know about the
// runner, and then it would not be an island.

export const rule = {
  id: "rules/no-self-import",
  description: "a module must not import itself",
  filename: null,
  reset(filename) {
    this.filename = filename ?? null;
  },
  check(text, line) {
    const match = text.match(/^\s*import\s[^;]*?from\s+["']([^"']+)["']/);
    if (!match || !this.filename) return null;
    const target = match[1].replace(/^\.\//, "").replace(/\.js$/, "");
    const self = this.filename.replace(/\.js$/, "");
    return target === self
      ? { line, id: "rules/no-self-import", message: `imports itself (${match[1]})` }
      : null;
  },
};
