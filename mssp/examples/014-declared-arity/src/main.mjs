// One query string, three readers, four fields with declared arity.
//
//   node src/main.mjs             what SCL runs, and what the other readers said
//   node src/main.mjs --strict    exit 1 when the configured reader refuses
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as report from "./DMS/report.mjs";
import * as policy from "./SCL/policy.mjs";
import * as request from "./SMS/request.mjs";
import * as declaredArity from "./TMS/readers/declared_arity.mjs";
import * as firstWins from "./TMS/readers/first_wins.mjs";
import * as lastWins from "./TMS/readers/last_wins.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const CONTRACT = JSON.parse(fs.readFileSync(path.join(here, "FMS", "contract.json"), "utf8"));
const MODULES = Object.fromEntries(
  [firstWins, lastWins, declaredArity].map((m) => [m.READER, m]));

// A request a browser can produce without anything going wrong: two checkboxes
// ticked, and `page` repeated because a stale form field was submitted twice.
export const QUERY = "q=mssp&page=2&page=3&tag=structure&tag=evidence&sort=date";

function main(argv) {
  const out = (line = "") => process.stdout.write(`${line}\n`);
  out(`\n== one request, read three ways\n\n  ${QUERY}`);

  const results = request.readerNames().map((name) =>
    request.readAll(QUERY, name, CONTRACT.fields));
  const bad = results.find((r) => r.problem);
  if (bad) { out(`  !! ${bad.problem}`); return 1; }

  report.table(results, CONTRACT.fields, out);
  report.whoCouldRefuse(results, MODULES, out);

  out("\n  `page` was sent twice. first-wins says 2, last-wins says 3, and neither");
  out("  says a choice was made. Only the reader that knows `page` was declared");
  out("  `one` can tell a repeated checkbox from a repeated mistake.");

  const configured = results.find((r) => r.reader === policy.reader());
  out(`\n== this deployment reads with ${policy.reader()}`);
  for (const row of configured.refusals) {
    out(`    REFUSED  ${row.field}: ${row.because}`);
  }
  if (!configured.refusals.length) out("    nothing refused");

  report.gaps(out);

  if (argv.includes("--strict") && configured.refusals.length && policy.refusalIsFatal()) return 1;
  return 0;
}

process.exitCode = main(process.argv.slice(2));
