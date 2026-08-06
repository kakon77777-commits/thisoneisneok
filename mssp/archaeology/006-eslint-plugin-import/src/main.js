// Run the enabled rules over a small sample file.
//
//   node src/main.js

import { load, apply } from "./SMS/registry.js";
import { enabled, allowsDeprecatedNames } from "./SCL/policy.js";
import { render } from "./DMS/report.js";

const SAMPLE = [
  'import { a } from "./a.js";',
  "const x = 1;",
  'import { b } from "./b.js";',   // rules/first should object
  'import { self } from "./sample.js";', // rules/no-self-import should object
].join("\n");

const rules = [];
const findings = [];
const lines = SAMPLE.split("\n");

for (const requested of enabled()) {
  const loaded = await load(requested);
  if (loaded.deprecated && !allowsDeprecatedNames()) {
    rules.push({ ...loaded, requested, loaded: false, why: "SCL refuses deprecated names" });
    continue;
  }
  rules.push({ ...loaded, requested, loaded: Boolean(loaded.rule) });
  if (!loaded.rule) continue;
  loaded.rule.reset?.("sample.js");
  findings.push(...apply(loaded.rule, lines));
}

process.stdout.write(
  render({ rules, findings, linesScanned: lines.length }),
);
