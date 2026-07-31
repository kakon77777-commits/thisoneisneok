// The island test, as an executable file rather than a claim.
//
// Builds a system with the minimal SMS and EXACTLY ONE TMS, stubs every tool,
// runs that module's representative task, and asserts that nothing else was
// loaded. Run: node src/island-test.js

import assert from "node:assert/strict";
import { createRegistry } from "./SMS/registry.js";
import { runTasks } from "./SMS/runner.js";
import { createTrace } from "./DMS/trace.js";
import { jsonReporter } from "./TMS/reporters/json.js";
import { fileReadHandler } from "./TMS/handlers/file-read.js";

let failures = 0;
function check(name, fn) {
  try {
    fn();
    console.log(`  [OK]   ${name}`);
  } catch (error) {
    failures += 1;
    console.log(`  [FAIL] ${name} — ${error.message}`);
  }
}

console.log("island test: TMS/reporters/json, alone");

// Only the json reporter is registered. text.js is never imported. If json had
// reached into text for its summary numbers, this file would not even load.
const registry = createRegistry().addReporter(jsonReporter());
const trace = createTrace();
let tick = 0;
const report = await runTasks({
  tasks: [{ id: "read-config", type: "file.read", path: "data/config.yaml" }],
  registry,
  trace,
  clock: () => (tick += 5),
});
const rendered = JSON.parse(registry.reporterList()[0].render(report));

check("only one TMS loaded", () => {
  const loaded = registry.loaded();
  assert.deepEqual(loaded.reporters, ["json"]);
  assert.deepEqual(loaded.handlers, []);
});
check("renders a report with no sibling TMS present", () => {
  assert.equal(typeof rendered.counts.skipped, "number");
  assert.equal(rendered.counts.skipped, 1, "no handler was loaded, so the task is skipped");
});
check("absent handler is a skip, not a crash", () => {
  assert.equal(report.results[0].outcome, "skipped");
});
check("DMS explains the skip", () => {
  assert.match(trace.humanView(registry), /no handler for "file\.read"/);
});

console.log("\nisland test: TMS/handlers/file-read, alone");

const handlerOnly = createRegistry().addHandler(fileReadHandler({ readFile: async () => "abc" }));
const handlerTrace = createTrace();
let tick2 = 0;
const handlerReport = await runTasks({
  tasks: [
    { id: "allowed", type: "file.read", path: "data/ok.txt" },
    { id: "escaping", type: "file.read", path: "data/../../secret" },
  ],
  registry: handlerOnly,
  trace: handlerTrace,
  clock: () => (tick2 += 5),
});

check("runs with a stubbed tool and no reporter registered", () => {
  assert.equal(handlerReport.results[0].outcome, "ok");
  assert.deepEqual(handlerOnly.loaded().reporters, []);
});
check("SCL refuses the traversal path, and the core does the refusing", () => {
  assert.equal(handlerReport.results[1].outcome, "skipped");
  assert.match(handlerReport.results[1].detail, /denied: path traversal/);
});

console.log(failures ? `\n${failures} check(s) failed` : "\nall island checks passed");
process.exit(failures ? 1 : 0);
