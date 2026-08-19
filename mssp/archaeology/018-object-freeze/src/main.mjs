// One frozen object, two consumers, and a declaration that means different
// things to each of them.
//
//   node src/main.mjs            what each mode does with the same assignment
//   node src/main.mjs --strict   exit 1 if a silent violation is possible here
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as report from "./DMS/report.mjs";
import * as upstream from "./SMS/upstream.mjs";
import * as sloppy from "./TMS/modes/sloppy.mjs";
import * as strict from "./TMS/modes/strict.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const POLICY = JSON.parse(fs.readFileSync(path.join(here, "SCL", "policy.json"), "utf8"));
const MODES = { sloppy, strict };
const say = (line = "") => process.stdout.write(`${line}\n`);

function main(argv) {
  say(`\n  ${upstream.runtime()}`);
  say(`  ${POLICY.deployment}: consumers loaded in ${POLICY.mode} mode\n`);

  const rows = [
    { object: "frozen", ...upstream.through(sloppy, upstream.frozen()) },
    { object: "frozen", ...upstream.through(strict, upstream.frozen()) },
    { object: "never frozen", ...upstream.through(sloppy, upstream.neverFrozen()) },
    { object: "never frozen", ...upstream.through(strict, upstream.neverFrozen()) },
  ];
  say(report.writes(rows));
  say("");
  say("  Row 1 is the finding: the expression evaluated to 999 and the object kept 100.");
  say("  Rows 3 and 4 are the control - a never-frozen object returns 999 too, which is");
  say("  what makes `returned` uninformative rather than merely wrong.\n");

  say(`  Object.freeze.length = ${upstream.freezeArity()} - one argument, the object.`);
  say("  There is no second argument for what a violation means, so the declarer");
  say("  cannot state it and cannot see which consumer it got.\n");

  const nested = upstream.nested();
  const before = nested.inner.price;
  for (const mode of [sloppy, strict]) mode.assign(nested.inner, "price", 999);
  say("  and the declaration is shallower than it reads:");
  say(report.shallow(before, nested.inner.price));

  const silentPossible = !upstream.reportsViolations(MODES.sloppy);
  if (argv.includes("--strict") && silentPossible && POLICY.a_silent_violation_is === "fatal") {
    say(`\n  --strict: a sloppy-mode consumer swallows the violation and this deployment`);
    say(`  calls that fatal. ${POLICY.what_this_cannot_reach}`);
    return 1;
  }
  return 0;
}

process.exitCode = main(process.argv.slice(2));
