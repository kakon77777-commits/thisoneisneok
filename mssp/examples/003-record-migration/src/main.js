// Run the migration.
//
//   node src/main.js            the shipped fixture
//   node src/main.js --summary  what a conventional report would have said
//
// The second one is the argument. It prints the sentence a normal migration
// tool prints, and the sentence is true.

import { render, assessment } from "./DMS/ledger.js";
import { record } from "./SMS/model.js";
import { migrate } from "./SMS/pipeline.js";
import { normalisePhone } from "./TMS/transforms/normalise-phone.js";
import { splitName } from "./TMS/transforms/split-name.js";

// Note what is absent: not one record carries a phone number. That is the
// fixture doing its job — the phone transform is loaded, correct, and never
// reached, which is the state a summary line cannot distinguish from working.
const RECORDS = [
  record("r-001", { name: "Neo K", email: "a@example.com" }),
  record("r-002", { name: "Ada Lovelace", email: "b@example.com" }),
  record("r-003", { name: "Prince", email: "c@example.com" }),
  record("r-004", { email: "d@example.com" }),
  record("r-005", { name: "Grace Brewster Hopper", email: "e@example.com" }),
];

function main(argv) {
  const result = migrate(RECORDS, [splitName, normalisePhone]);
  const verdict = assessment(result);

  if (argv.includes("--summary")) {
    const failed = result.reconciliation.counts.failed;
    console.log(`\n== what a conventional migration reports`);
    console.log(`\n  ${RECORDS.length} records migrated, ${failed} errors\n`);
    console.log("  Every word of that is true. It is also true of a run that");
    console.log("  touched nothing, and of a run that lost two records to an");
    console.log("  early return. Run without --summary for the difference.\n");
    return 0;
  }

  console.log("\n== record migration");
  console.log(render(result));

  console.log("");
  console.log(`  trustworthy   ${verdict.trustworthy}   (the arithmetic balances)`);
  console.log(`  demonstrates  ${verdict.demonstrates}   (at least one capability actually ran)`);
  if (verdict.unexercised.length) {
    console.log(`  unexercised   ${verdict.unexercised.join(", ")}`);
  }

  // This program's exit code reports whether the *ledger* did its job, not
  // whether the fixture was clean. The fixture is deliberately unclean.
  const problems = [];
  if (!verdict.trustworthy) problems.push("the run did not reconcile");
  if (verdict.unexercised.length === 0) {
    problems.push("every capability ran, so this fixture no longer demonstrates the unexercised case");
  }
  if (problems.length) {
    console.log(`\n  LEDGER FAILED: ${problems.join("; ")}`);
    return 1;
  }
  console.log("\n  the ledger reported an unexercised capability, which a summary line cannot.");
  return 0;
}

process.exit(main(process.argv.slice(2)));
