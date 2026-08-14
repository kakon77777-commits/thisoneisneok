// URLSearchParams: what each accessor lets through.
//
//   node src/main.mjs            the readings, the declarations, the mutators
//   node src/main.mjs --strict   exit 1 if a declaration disagrees with behaviour
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as report from "./DMS/report.mjs";
import * as policy from "./SCL/policy.mjs";
import * as accessors from "./SMS/accessors.mjs";
import * as upstream from "./SMS/upstream.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const ARCH = JSON.parse(fs.readFileSync(path.join(here, "FMS", "architecture.json"), "utf8"));

const out = (line = "") => process.stdout.write(`${line}\n`);
const { loaded, problems } = await accessors.load();
if (problems.length) {
  for (const problem of problems) out(`  !! ${problem}`);
  process.exit(1);
}

out(`\n== one key, three values  [node ${upstream.version()}]\n\n  ${upstream.SAMPLE}`);
report.readings(upstream.readings(), out);

out("\n  get keeps the FIRST. Object.fromEntries keeps the LAST. Neither says so.");

const measured = Object.fromEntries(Object.keys(loaded).map((name) =>
  [name, accessors.survivorCount(name, upstream.SAMPLE)]));
out("\n== each accessor's declaration, checked by running it");
const original = new URLSearchParams(upstream.SAMPLE).getAll("tag").length;
report.declarations(loaded, measured, original, out);

const wrong = Object.keys(loaded).filter((name) => loaded[name].HOW_MANY_SURVIVE === "one"
  ? measured[name] !== 1
  : measured[name] < original);

out("\n== set and append are not siblings");
const m = upstream.mutations();
out(`    before          ${m.before}`);
out(`    after set       ${m.afterSet}`);
out(`    after append    ${m.afterAppend}`);

out("\n== what answers the same however it went");
for (const [label, value] of Object.entries(upstream.returnValues())) {
  out(`    ${label.padEnd(16)} ${JSON.stringify(value)}`);
}

const { module, problem } = accessors.resolve(policy.accessor(), loaded);
if (problem) { out(`\n  !! ${problem}`); process.exit(1); }
out(`\n== this deployment reads a single-valued field with \`${module.ACCESSOR}\``);
out(`    which keeps ${module.KEEPS} and lets ${measured[module.ACCESSOR]} of 3 through`);

report.gaps(out);

if (process.argv.includes("--strict") && wrong.length) {
  for (const name of wrong) out(`\n  !! ${name}: declared ${loaded[name].HOW_MANY_SURVIVE}, measured ${measured[name]}`);
  process.exit(1);
}
