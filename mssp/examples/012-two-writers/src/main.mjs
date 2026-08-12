// Two writers, a written-down schedule, and a requirement that is refused.
//
//   node src/main.mjs            what SCL runs, plus the combination it refuses
//   node src/main.mjs --strict   exit 1 when a requirement is unmet
//   node src/main.mjs --all      every medium x operation x schedule
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as report from "./DMS/report.mjs";
import * as policy from "./SCL/policy.mjs";
import * as schedule from "./SMS/schedule.mjs";
import * as store from "./SMS/store.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const CONTRACT = JSON.parse(fs.readFileSync(path.join(here, "FMS", "contract.json"), "utf8"));
const tempDir = () => fs.mkdtempSync(path.join(os.tmpdir(), "mssp-012-"));

const SCHEDULES = { interleaved: schedule.INTERLEAVED, "one-at-a-time": schedule.ONE_AT_A_TIME };
const increment = (record) => ({ ...record, n: record.n + 1 });

export function runOnce(mediumName, operationName, scheduleName, { retry = false } = {}) {
  const opened = store.open({ mediumName, operationName, dir: tempDir(), allowUnmet: true });
  if (opened.problem) return { problem: opened.problem };
  const { store: orders } = opened;
  orders.seed("counter", { n: 0 });

  const makeWriters = () => [orders.writer("counter", increment), orders.writer("counter", increment)];
  const { trace } = retry
    ? schedule.runWithRetries(makeWriters, SCHEDULES[scheduleName])
    : { trace: schedule.run(makeWriters(), SCHEDULES[scheduleName]) };
  return {
    medium: mediumName,
    operation: operationName,
    schedule: scheduleName + (retry ? " + retry" : ""),
    expected: 2,
    final: orders.read("counter")?.n ?? null,
    // The measure that separates a refusal from a silent loss. They can end at
    // the same number; only one of them told anybody.
    reported: trace.some((step) => step.retry),
    unmet: opened.unmet,
    trace,
  };
}

function main(argv) {
  const out = (line = "") => process.stdout.write(`${line}\n`);

  if (argv.includes("--all")) {
    const rows = [];
    for (const mediumName of store.mediaNames()) {
      for (const operationName of store.operationNames()) {
        for (const scheduleName of Object.keys(SCHEDULES)) {
          rows.push(runOnce(mediumName, operationName, scheduleName));
        }
        rows.push(runOnce(mediumName, operationName, "interleaved", { retry: true }));
      }
    }
    out("\n== every combination, both schedules");
    report.outcome(rows, out);
    out("\n  Three things this table says that the numbers alone do not:");
    out("    - the medium column changes nothing. atomic-file and torn-file agree");
    out("      on every row, because atomicity of a write is not the guarantee a");
    out("      read-modify-write needs.");
    out("    - the two interleaved rows for one medium END AT THE SAME NUMBER.");
    out("      What differs is whether anybody was told, and a retry is only");
    out("      worth anything to the one that reported.");
    out("    - every one-at-a-time row is clean. A test with a single writer sees");
    out("      nothing here at all, however many assertions it makes.");
    return 0;
  }

  const configured = store.open({
    mediumName: policy.medium(), operationName: policy.operation(), dir: tempDir(),
  });
  out(`\n== what this deployment runs: ${policy.medium()} + ${policy.operation()}`);
  if (configured.problem) {
    out(`  !! ${configured.problem}`);
    return 1;
  }
  const rows = [
    ...Object.keys(SCHEDULES).map((name) => runOnce(policy.medium(), policy.operation(), name)),
    runOnce(policy.medium(), policy.operation(), "interleaved", { retry: true }),
  ];
  report.outcome(rows, out);
  report.trace(rows[0].trace, out);

  out("\n== the combination this deployment refuses, and why");
  const refused = store.open({
    mediumName: policy.medium(), operationName: "read-modify-write", dir: tempDir(),
  });
  out(`  !! ${refused.problem}`);
  const anyway = runOnce(policy.medium(), "read-modify-write", "interleaved");
  out(`     run anyway, interleaved: two increments from 0 end at ${anyway.final}`);
  out(`     ${CONTRACT.guarantees["serialised-transaction"].split(". ")[1]}`);

  report.gaps(out);

  if (argv.includes("--strict") && refused.unmet?.length && policy.unmetIsFatal()) return 1;
  return 0;
}

process.exitCode = main(process.argv.slice(2));
