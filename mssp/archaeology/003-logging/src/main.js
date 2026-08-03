// Reproduce the upstream failure, then show the re-cut refusing to reproduce it.
//
//   node src/main.js

import { makeRegistry } from "./DMS/registry.js";
import { PermissionError } from "./SCL/policy.js";
import { emit } from "./SMS/pipeline.js";
import { makeRecord } from "./SMS/record.js";
import { collectSink } from "./TMS/sinks/collect.js";
import { textSink } from "./TMS/sinks/text.js";

const plain = (r) => `${r.level.toUpperCase().padEnd(7)} ${r.logger}: ${r.message}`;
const stamped = (r) => `[t=${r.at}] ${r.level.toUpperCase().padEnd(7)} ${r.logger}: ${r.message}`;

function main() {
  console.log("\n== logging re-cut");
  const registry = makeRegistry();

  console.log("\n  1. a library logs before anything is configured");
  const early = emit(makeRecord("lib/worker", "info", "starting up"), registry.current() ?? {});
  console.log(`     delivered=${early.delivered}  why="${early.why}"`);
  console.log("     upstream this call would have configured the root logger as a side effect");

  console.log("\n  2. the library tries to configure it");
  try {
    registry.configure("lib/worker", { format: plain, sinks: [] });
  } catch (error) {
    if (!(error instanceof PermissionError)) throw error;
    console.log(`     refused: ${error.message}`);
  }

  console.log("\n  3. the application configures it, and is told that it took");
  const collected = collectSink();
  const first = registry.configure("app/main", { threshold: "info", format: plain, sinks: [collected] });
  console.log(`     applied=${first.applied}  installedBy=${first.installedBy}`);

  console.log("\n  4. a second configuration attempt — the upstream silent no-op");
  const second = registry.configure("app/main", { threshold: "debug", format: stamped, sinks: [collected] });
  console.log(`     applied=${second.applied}  why="${second.why}"`);
  console.log("     upstream: basicConfig(format=...) returns None here and discards the format");

  console.log("\n  5. logging now works, and says where it went");
  const out = emit(makeRecord("lib/worker", "info", "did the thing"), registry.current());
  console.log(`     delivered=${out.delivered}  sinks=[${out.sinks.join(", ")}]`);
  console.log(`     line: ${collected.lines.at(-1)}`);

  console.log("\n  6. status: the question upstream cannot be asked");
  console.log(`     ${JSON.stringify(registry.status())}`);

  console.log("\n  7. an explicit replace is allowed, and is not silent either");
  const third = registry.replace("app/main", { threshold: "debug", format: stamped, sinks: [textSink((t) => console.log(`       ${t}`))] });
  console.log(`     applied=${third.applied}  why="${third.why}"`);
  emit(makeRecord("app/main", "debug", "now with timestamps"), registry.current());

  // The one assertion worth making rather than eyeballing: every outcome above
  // carried a reason. A run where some call returned nothing would mean the
  // repair had not held.
  const silent = [early, first, second, third, out].filter((r) => r === undefined || r === null);
  if (silent.length) {
    console.log("\n  RE-CUT FAILED: a call returned nothing");
    return 1;
  }
  if (second.applied) {
    console.log("\n  RE-CUT FAILED: the second configure took effect, so the guard is not being exercised");
    return 1;
  }
  console.log("\n  every configuration attempt reported what it did; none of them was silent.");
  return 0;
}

process.exit(main());
