// Five ways to meet a Result, and what the compiler does about each.
//
//   node src/main.mjs            the table, built by really running cargo
//   node src/main.mjs --strict   exit 1 if this deployment's lint setting has a gap
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as report from "./DMS/report.mjs";
import * as compiler from "./SMS/compiler.mjs";
import * as bareCall from "./TMS/routes/bare_call.mjs";
import * as directAssign from "./TMS/routes/direct_assign.mjs";
import * as explicitDiscard from "./TMS/routes/explicit_discard.mjs";
import * as matchArm from "./TMS/routes/match_arm.mjs";
import * as unwrap from "./TMS/routes/unwrap.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const POLICY = JSON.parse(fs.readFileSync(path.join(here, "SCL", "policy.json"), "utf8"));
export const ROUTES = [bareCall, explicitDiscard, unwrap, directAssign, matchArm];
const say = (line = "") => process.stdout.write(`${line}\n`);

function main(argv) {
  if (!compiler.available()) {
    say("\n  REFUSED: no rust toolchain on this machine. This entry measures a compiler and");
    say("  cannot be simulated - it reports nothing rather than reporting a guess.");
    return 1;
  }
  say(`\n  ${compiler.versions()}`);
  say(`  ${POLICY.deployment}: ${POLICY.lint_setting}\n`);

  const rows = ROUTES.map((route) => ({ route, ...compiler.build(route.BODY) }));
  say(report.table(rows));
  say("");
  say("  The control is the last row: handling written out, compiles clean, no warning.");
  say("  Without it, `let _ = ...` compiling clean would be consistent with everything");
  say("  compiling clean, and would be evidence of nothing.\n");

  const strict = ROUTES.map((route) => ({ route, ...compiler.build(route.BODY, { deny: true }) }));
  say(`  and with the consumer's own ${POLICY.lint_setting}:`);
  say(report.table(strict));
  say("");

  const discardPlain = rows.find((r) => r.route === explicitDiscard);
  const discardStrict = strict.find((r) => r.route === explicitDiscard);
  const assignRow = rows.find((r) => r.route === directAssign);
  say(report.boundary(discardPlain, discardStrict, assignRow));

  const gap = discardStrict.compiles === true;
  if (argv.includes("--strict") && gap) {
    say(`\n  --strict: ${POLICY.what_this_cannot_reach}`);
    compiler.cleanup();
    return 1;
  }
  compiler.cleanup();
  return 0;
}

process.exitCode = main(process.argv.slice(2));
