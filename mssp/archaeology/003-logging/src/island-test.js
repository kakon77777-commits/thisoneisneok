// The island test, the upstream measurement, and four attempts to defeat the repair.
//
//   node src/island-test.js

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { makeRegistry } from "./DMS/registry.js";
import { PermissionError } from "./SCL/policy.js";
import { emit } from "./SMS/pipeline.js";
import { makeRecord } from "./SMS/record.js";
import { collectSink } from "./TMS/sinks/collect.js";
import { textSink } from "./TMS/sinks/text.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const failures = [];
const report = (label, ok, detail = "") => {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` - ${detail}` : ""}`);
  if (!ok) failures.push(label);
};

const plain = (r) => `${r.level.toUpperCase()} ${r.message}`;

console.log("\n== 1. each sink alone, no sibling loaded");
{
  const c = collectSink();
  const out = emit(makeRecord("x", "info", "hello"), { format: plain, sinks: [c] });
  report("sinks/collect works with no other sink loaded", out.delivered && c.lines.length === 1,
    `${c.lines.length} line(s)`);

  const written = [];
  const t = textSink((line) => written.push(line));
  const out2 = emit(makeRecord("x", "info", "hello"), { format: plain, sinks: [t] });
  report("sinks/text works with no other sink loaded", out2.delivered && written.length === 1);
  report("a sink is handed its destination, it does not name one",
    !fs.readFileSync(path.join(here, "TMS/sinks/text.js"), "utf8").includes("stdout"));
}

console.log("\n== 2. no TMS imports a sibling TMS");
{
  const dir = path.join(here, "TMS", "sinks");
  const files = fs.readdirSync(dir);
  const offenders = files.filter((f) => {
    const source = fs.readFileSync(path.join(dir, f), "utf8");
    return files.some((other) => other !== f && source.includes(`./${other}`));
  });
  report("no sibling sink import", offenders.length === 0, offenders.join(", ") || `${files.length} unit(s) scanned`);
}

console.log("\n== 3. the upstream failure, measured now");
{
  const probe = [
    "import logging, json",
    "before = len(logging.root.handlers)",
    "logging.info('a convenience call')",
    "after = len(logging.root.handlers)",
    "f1 = logging.root.handlers[0].formatter",
    "r = logging.basicConfig(format='%(asctime)s CUSTOM %(message)s')",
    "f2 = logging.root.handlers[0].formatter",
    "print(json.dumps({'before': before, 'after': after, 'formatter_changed': f1 is not f2, 'returned': repr(r)}))",
  ].join("; ");

  let measured = null;
  try {
    const raw = execFileSync("python", ["-c", probe], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    measured = JSON.parse(raw.trim().split("\n").at(-1));
  } catch {
    report("python is available to measure upstream", false, "could not run python");
  }

  if (measured) {
    console.log(`     root handlers ${measured.before} -> ${measured.after} after one logging.info()`);
    console.log(`     basicConfig(format=...) returned ${measured.returned}, formatter changed: ${measured.formatter_changed}`);
    report("a convenience call configures the root as a side effect", measured.after > measured.before);
    report("the later basicConfig is a no-op", measured.formatter_changed === false,
      "if this starts failing, upstream changed and this entry needs revisiting");
    report("and it reports nothing about that", measured.returned === "None");
  }
}

console.log("\n== 4. the repair holds, and can be seen to");
{
  const registry = makeRegistry();
  const c = collectSink();

  const first = registry.configure("app/main", { format: plain, sinks: [c] });
  report("the first configure reports that it applied", first.applied === true);

  const second = registry.configure("app/main", { format: plain, sinks: [collectSink()] });
  report("the second is refused rather than silently dropped", second.applied === false);
  report("and it says why", second.why.includes("already configured"), `"${second.why}"`);

  const replaced = registry.replace("app/main", { format: plain, sinks: [c] });
  report("an explicit replace is allowed and also reports", replaced.applied === true && replaced.why !== "");
}

console.log("\n== 5. the checks can fail");
{
  const registry = makeRegistry();

  let refused = false;
  try {
    registry.configure("lib/worker", { format: plain, sinks: [] });
  } catch (error) {
    refused = error instanceof PermissionError;
  }
  report("SCL refuses a capability with may_configure:false", refused);

  // configured, permitted, and nowhere to go — the state upstream reports as success
  registry.configure("app/main", { format: plain, sinks: [] });
  const status = registry.status();
  report("a sink-less configuration is reported as unreachable", status.configured && status.reachable === false,
    `"${status.why}"`);

  const nowhere = emit(makeRecord("x", "info", "into the void"), registry.current());
  report("and emitting into it is not called delivered", nowhere.delivered === false, `why="${nowhere.why}"`);

  const below = emit(makeRecord("x", "debug", "quiet"), { threshold: "info", format: plain, sinks: [collectSink()] });
  report("below-threshold is distinguishable from no-sink", below.delivered === false && below.why.includes("threshold"),
    `why="${below.why}"`);
}

console.log("");
if (failures.length) {
  console.log(`  ${failures.length} check(s) failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("  island test passed");
