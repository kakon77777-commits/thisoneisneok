// Resolve names through the record, then check every declaration against
// behaviour.
//
//   node src/main.js
//   node src/main.js --shims     # what the host-shim generator would emit

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { checkAlias } from "./SMS/contract.js";
import { load, record, resolve } from "./SMS/registry.js";
import { render } from "./DMS/report.js";
import * as policy from "./SCL/policy.js";

const here = path.dirname(fileURLToPath(import.meta.url));

const FIXTURE = [
  '"use strict";',
  'import { a } from "./a.js";',
  "var legacy = 1;",
  "const x = 2;",
  '"use strict";',
];

async function main(argv) {
  if (argv.includes("--shims")) {
    // The host-constrained case: a name the host must see as its own object.
    // Generated, never authored under TMS/, so no authored unit references a
    // sibling and the structural rule needs no exception.
    for (const alias of record.compatibility_aliases) {
      if (!alias.shim.startsWith("generated")) continue;
      const target = alias.replacement.split("/").pop();
      process.stdout.write(
        `\n  // build/host-shims/${alias.old_name.split("/").pop()}.js  (generated from FMS)\n` +
        `  export { rule as base } from "../../src/TMS/rules/${target}.js";\n` +
        `  // then re-exported with meta.deprecated = true, per allowed_deltas\n`,
      );
    }
    return 0;
  }

  const results = [];
  for (const alias of record.compatibility_aliases) {
    const oldRule = await load(alias.old_name) ?? await shimmed(alias);
    const newRule = await load(alias.replacement);
    results.push(checkAlias(
      alias, oldRule, newRule, FIXTURE,
      policy.currentVersion(), policy.majorsBetween, policy.maxWindowVersions(),
    ));
  }

  process.stdout.write(render(results, policy.currentVersion()));

  // Two different questions want this exit code, and it can only answer one.
  // "Did the report get produced" is the tool's own status; "do the
  // declarations hold" is the finding. Defaulting to the first and putting the
  // second behind --strict means a caller has to say which one it is asking
  // about, instead of a single number quietly meaning whichever the author had
  // in mind. The report says which aliases are broken either way.
  const broken = results.filter((r) => !r.holds).length;
  if (argv.includes("--strict")) {
    if (broken) process.stdout.write(`\n  --strict: exiting 1 because ${broken} declaration(s) do not hold\n`);
    return broken ? 1 : 0;
  }
  return 0;
}

/** A generated shim, materialised in memory: the replacement plus the deltas. */
async function shimmed(alias) {
  const base = await load(alias.replacement);
  if (!base) return null;
  return { ...base, meta: { ...base.meta, deprecated: true } };
}

process.exit(await main(process.argv.slice(2)));
