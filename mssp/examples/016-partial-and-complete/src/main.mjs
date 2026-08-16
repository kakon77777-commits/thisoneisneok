// Three sources, one of which hands over real records and then breaks.
//
//   node src/main.mjs             the run under the combiner SCL names
//   node src/main.mjs --compare   removing the broken source, against keeping it
//   node src/main.mjs --strict    exit 1 when a run did not finish and the policy is fatal
import * as report from "./DMS/report.mjs";
import * as policy from "./SCL/policy.mjs";
import * as collect from "./SMS/collect.mjs";

const say = (line = "") => process.stdout.write(`${line}\n`);

function combineWith(name, sources, options = {}) {
  const { combiners } = collect.load();
  const [combiner, problem] = collect.resolveCombiner(name, combiners);
  if (problem) throw new Error(problem);
  const rows = collect.runAll(sources, options);
  const result = combiner.combine(rows);
  return { rows, result, unfinished: collect.fromUnfinished(rows, result.records) };
}

function compare(sources) {
  const removed = combineWith("all-or-nothing", sources, { absent: ["breaks-midway"] });
  const kept = combineWith("all-or-nothing", sources);
  const settled = combineWith("settle-each", sources);

  say("\n                                          kept   what the reader ends up holding");
  say(`  removed (island test)   all-or-nothing  ${String(removed.result.records.length).padEnd(6)} ` +
    `${removed.rows.filter((r) => r.outcome === "worked").length} complete sources`);
  say(`  present and failing     all-or-nothing  ${String(kept.result.records.length).padEnd(6)} ` +
    `nothing - ${kept.result.discarded} records discarded`);
  say(`  present and failing     settle-each     ${String(settled.result.records.length).padEnd(6)} ` +
    `${settled.unfinished} of them from a source that did not finish`);
  say("\n  Removing the broken source gives MORE than keeping it.");
  say("  Example 015 measured the opposite: there, removed and broken were the same number.");
}

function main(argv) {
  const { sources, problems } = collect.load();
  if (problems.length > 0) {
    for (const problem of problems) say(`  REFUSED: ${problem}`);
    return 1;
  }

  if (argv.includes("--compare")) {
    compare(sources);
    return 0;
  }

  const { rows, result, unfinished } = combineWith(policy.combinerName(), sources);
  say(`\n  ${policy.describe()}\n`);
  say(report.runs(rows));
  say("");
  say(report.combined(policy.combinerName(), result, unfinished));
  say("");
  say(report.whatACountWouldHaveSaid(rows));

  const partial = rows.filter((row) => row.outcome === "partial");
  if (argv.includes("--strict") && partial.length > 0 && policy.isFatal()) {
    say(`\n  --strict: ${partial.length} source(s) did not finish and this deployment calls that fatal`);
    return 1;
  }
  return 0;
}

process.exitCode = main(process.argv.slice(2));
