// Entry point. The only file that knows which TMS exist — which is what lets
// every other file stay unaware of them.

import { createRegistry } from "./SMS/registry.js";
import { runTasks } from "./SMS/runner.js";
import { createTrace } from "./DMS/trace.js";
import { fileReadHandler } from "./TMS/handlers/file-read.js";
import { httpGetHandler } from "./TMS/handlers/http-get.js";
import { textReporter } from "./TMS/reporters/text.js";
import { jsonReporter } from "./TMS/reporters/json.js";

// Tools are stubbed so the example runs anywhere with no network and no disk
// layout. Real implementations would be injected the same way.
const tools = {
  readFile: async (path) => `<contents of ${path}>`.repeat(3),
  fetchUrl: async (url) => ({ status: url.includes("/missing") ? 404 : 200, bytes: 1024 }),
};

const tasks = [
  { id: "read-config", type: "file.read", path: "data/config.yaml" },
  { id: "read-escape", type: "file.read", path: "../../etc/passwd" },
  { id: "fetch-home", type: "http.get", url: "https://example.org/" },
  { id: "fetch-missing", type: "http.get", url: "https://example.org/missing" },
  { id: "fetch-elsewhere", type: "http.get", url: "https://not-allowed.test/" },
  { id: "wipe-data", type: "file.delete", path: "data/" },
  { id: "send-mail", type: "mail.send", to: "someone@example.org" },
];

const trace = createTrace();
const registry = createRegistry()
  .addHandler(fileReadHandler(tools))
  .addHandler(httpGetHandler(tools))
  .addReporter(textReporter())
  .addReporter(jsonReporter());

// A monotonic fake clock keeps the printed durations identical on every run, so
// the output in the README stays true and a diff means something changed.
let tick = 0;
const clock = () => (tick += 5);

const report = await runTasks({ tasks, registry, trace, clock });

for (const reporter of registry.reporterList()) {
  console.log(`\n--- ${reporter.name} ---`);
  console.log(reporter.render(report));
}

console.log("\n--- DMS human view ---");
console.log(trace.humanView(registry));

// `wipe-data` and `send-mail` are both absent from the result for different
// reasons: one is denied by SCL, the other has no handler loaded. The trace is
// where that distinction survives.
process.exit(report.passed ? 0 : 0); // reporting demo, not a CI gate
