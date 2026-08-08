// A module must not import itself. Imports nothing.
export const rule = {
  id: "rules/no-self-import",
  meta: { category: "correctness", description: "a module must not import itself" },
  filename: "sample.js",
  check(text, line) {
    const match = text.match(/^\s*import\s[^;]*?from\s+["']([^"']+)["']/);
    if (!match) return null;
    const target = match[1].replace(/^\.\//, "").replace(/\.js$/, "");
    return target === this.filename.replace(/\.js$/, "")
      ? { line, message: `imports itself (${match[1]})` }
      : null;
  },
};
