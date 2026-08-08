// Name resolution through the architecture record.
//
// No rule file mentions another rule file. A rename is a row in FMS, resolved
// here, and reported by DMS beside the result it produced.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
export const record = JSON.parse(
  fs.readFileSync(path.join(here, "..", "FMS", "architecture.json"), "utf8"),
);

export function aliasFor(name) {
  return record.compatibility_aliases.find((entry) => entry.old_name === name) ?? null;
}

export function resolve(requested) {
  const alias = aliasFor(requested);
  if (!alias) return { name: requested, via: null };
  return { name: alias.replacement, via: alias };
}

export async function load(name) {
  const file = path.join(here, "..", "TMS", `${name}.js`);
  if (!fs.existsSync(file)) return null;
  return (await import(`../TMS/${name}.js`)).rule;
}

/** Apply a rule to lines. The walk knows no rule by name. */
export function apply(rule, lines) {
  rule.reset?.();
  return lines
    .map((text, index) => rule.check(text, index + 1))
    .filter(Boolean);
}
