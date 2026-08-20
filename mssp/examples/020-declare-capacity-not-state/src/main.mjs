// Three readers over one stream, and a capacity claim that gets challenged.
//
//   node src/main.mjs              the run under the policy SCL names
//   node src/main.mjs --challenge  just the challenge table
//   node src/main.mjs --strict     exit 1 when a reader failed its challenge
import * as report from "./DMS/report.mjs";
import * as policy from "./SCL/policy.mjs";
import * as harness from "./SMS/challenge.mjs";

const say = (line = "") => process.stdout.write(`${line}\n`);

function main(argv) {
  const { readers, problems } = harness.load();
  if (problems.length > 0) {
    for (const problem of problems) say(`  REFUSED: ${problem}`);
    return 1;
  }

  const entries = harness.readAll(readers, harness.TRUNCATED_STREAM);
  const failed = entries.map((e) => e.challenge).filter((c) => c.claimed && !c.passed);

  say(`\n  ${policy.describe()}\n`);
  say(report.challenges(entries));
  say("");
  for (const entry of entries) say(`    ${entry.reader}: ${harness.verdict(entry.challenge)}`);
  say("");

  if (argv.includes("--challenge")) return failed.length > 0 && argv.includes("--strict") ? 1 : 0;

  const kept = entries.filter((e) => harness.accepted(e.challenge));
  say(`  reading the truncated stream (${harness.TRUNCATED_STREAM}):\n`);
  say(report.rows(kept));
  say("");
  say(report.floor(harness.floor(kept)));
  say("");
  say(report.refusals(failed));

  if (argv.includes("--strict") && failed.length > 0 && policy.refusesLiars()) {
    say(`\n  --strict: ${failed.length} reader(s) claimed a capacity the challenge did not `
      + `demonstrate, and that is fatal here`);
    return 1;
  }
  return 0;
}

process.exitCode = main(process.argv.slice(2));
