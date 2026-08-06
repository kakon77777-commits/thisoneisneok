// Resolving a rule name to a rule, including names that are renames.
//
// The repair lives here. Upstream, `imports-first` is a module that requires
// `./first` and re-exports it with deprecated:true — which makes the rename a
// property of a file, and makes that file the only one of 46 that reaches a
// sibling. Here the rename is a property of the catalogue, so no rule file
// mentions another rule file and the old name still works.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const catalogue = JSON.parse(
  fs.readFileSync(path.join(here, "..", "FMS", "catalogue.json"), "utf8"),
);

/** Follow renames to the name that has a file, reporting the hops taken. */
export function resolveName(requested) {
  const hops = [];
  let name = requested;
  // Bounded: a rename cycle is a catalogue error, not something to loop on.
  for (let i = 0; i <= catalogue.renames.length; i += 1) {
    const rename = catalogue.renames.find((r) => r.from === name);
    if (!rename) return { name, hops, deprecated: hops.length > 0 };
    hops.push({ from: rename.from, to: rename.to, since: rename.since });
    name = rename.to;
  }
  throw new Error(`rename cycle starting at ${requested}`);
}

export async function load(requested) {
  const resolved = resolveName(requested);
  const file = path.join(here, "..", "TMS", `${resolved.name}.js`);
  if (!fs.existsSync(file)) {
    return { ...resolved, rule: null, why: `no file at TMS/${resolved.name}.js` };
  }
  const module = await import(`../TMS/${resolved.name}.js`);
  return { ...resolved, rule: module.rule, why: null };
}

/** Apply one rule to one file's lines. The walk knows no rule by name. */
export function apply(rule, lines) {
  const findings = [];
  lines.forEach((text, index) => {
    const problem = rule.check(text, index + 1);
    if (problem) findings.push(problem);
  });
  return findings;
}
