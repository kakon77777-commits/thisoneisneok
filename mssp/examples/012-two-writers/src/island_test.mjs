// The island test.
//
//   node src/island_test.mjs
//
// Section 4 is the one this example exists for, and it is a control rather than
// an assertion: the same operations under a single-writer schedule are clean
// everywhere in the table. A test that can only produce one schedule cannot see
// a lost update, however many assertions it makes.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as schedule from "./SMS/schedule.mjs";
import * as store from "./SMS/store.mjs";
import { runOnce } from "./main.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const CONTRACT = JSON.parse(fs.readFileSync(path.join(here, "FMS", "contract.json"), "utf8"));
const failures = [];

const check = (label, ok, detail = "") => {
  process.stdout.write(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` - ${detail}` : ""}\n`);
  if (!ok) failures.push(label);
};
const say = (line = "") => process.stdout.write(`${line}\n`);
const tempDir = () => fs.mkdtempSync(path.join(os.tmpdir(), "mssp-012-"));

say("\n== 1. every TMS unit is an island and declares its side of the contract");
for (const kind of ["media", "operations"]) {
  const dir = path.join(here, "TMS", kind);
  const files = fs.readdirSync(dir).filter((n) => n.endsWith(".mjs")).sort();
  check(`there are two ${kind} files`, files.length === 2, files.join(", "));
  for (const file of files) {
    const source = fs.readFileSync(path.join(dir, file), "utf8");
    const reaches = [...source.matchAll(/^\s*import[^"']*["']([^"']+)["']/gm)].map((m) => m[1]);
    const siblings = reaches.filter((spec) => /\.\.\/|FMS|SCL|SMS|DMS/.test(spec));
    check(`${file} reaches no sibling set`, siblings.length === 0,
      reaches.join(", ") || "no imports at all");
  }
}
for (const name of store.mediaNames()) {
  const { module } = store.resolveMedium(name);
  check(`${name} declares what it guarantees`, Array.isArray(module.GUARANTEES),
    JSON.stringify(module.GUARANTEES));
}
for (const name of store.operationNames()) {
  const { module } = store.resolveOperation(name);
  check(`${name} declares what it requires`, module.REQUIRES.length > 0,
    JSON.stringify(module.REQUIRES));
}

say("\n== 2. a requirement nothing provides is refused before anything runs");
const refused = store.open({
  mediumName: "atomic-file", operationName: "read-modify-write", dir: tempDir() });
check("read-modify-write on any medium is refused", Boolean(refused.problem), refused.problem);
check("and no store is handed back", refused.store === undefined);
const allowed = store.open({
  mediumName: "atomic-file", operationName: "compare-and-set", dir: tempDir() });
check("compare-and-set on atomic-file is allowed", Boolean(allowed.store),
  `unmet: ${JSON.stringify(allowed.unmet)}`);
const mismatched = store.open({
  mediumName: "torn-file", operationName: "compare-and-set", dir: tempDir() });
check("compare-and-set on torn-file is refused - it needs atomic-replace",
  Boolean(mismatched.problem), mismatched.problem);
for (const [label, args] of [
  ["an unknown medium", { mediumName: "redis", operationName: "compare-and-set", dir: tempDir() }],
  ["an unknown operation", { mediumName: "atomic-file", operationName: "upsert", dir: tempDir() }],
]) {
  check(`${label} stops the run`, Boolean(store.open(args).problem), store.open(args).problem);
}

say("\n== 3. the medium column changes nothing, which is the point");
const byMedium = {};
for (const mediumName of store.mediaNames()) {
  byMedium[mediumName] = store.operationNames().map((operationName) => {
    const row = runOnce(mediumName, operationName, "interleaved");
    return `${operationName}:${row.final}:${row.reported}`;
  }).join(" | ");
}
check("atomic-file and torn-file give identical outcomes under the same schedule",
  new Set(Object.values(byMedium)).size === 1, Object.values(byMedium)[0]);
say("        Atomicity of a write is a real guarantee. It is not the guarantee a");
say("        read-modify-write needs, and no amount of it will be.");

say("\n== 4. THE CONTROL: a single-writer schedule sees none of this");
const oneAtATime = [];
const interleaved = [];
for (const mediumName of store.mediaNames()) {
  for (const operationName of store.operationNames()) {
    oneAtATime.push(runOnce(mediumName, operationName, "one-at-a-time"));
    interleaved.push(runOnce(mediumName, operationName, "interleaved"));
  }
}
check(`all ${oneAtATime.length} one-at-a-time runs end at 2 with nothing lost`,
  oneAtATime.every((row) => row.final === 2),
  oneAtATime.map((row) => row.final).join(", "));
check(`all ${interleaved.length} interleaved runs lose one`,
  interleaved.every((row) => row.final === 1),
  interleaved.map((row) => row.final).join(", "));
check("so the schedule, not the assertion, is what decides whether this is visible",
  oneAtATime.every((row) => row.final === 2) && interleaved.every((row) => row.final === 1));

say("\n== 5. two outcomes that end at the same number");
const silent = runOnce("atomic-file", "read-modify-write", "interleaved");
const told = runOnce("atomic-file", "compare-and-set", "interleaved");
check("read-modify-write and compare-and-set end at the same value",
  silent.final === told.final, `both ${silent.final}`);
check("and only one of them reported anything",
  silent.reported !== told.reported,
  `read-modify-write reported=${silent.reported}, compare-and-set reported=${told.reported}`);
const retried = runOnce("atomic-file", "compare-and-set", "interleaved", { retry: true });
const retriedSilently = runOnce("atomic-file", "read-modify-write", "interleaved", { retry: true });
check("retrying fixes the one that reported", retried.final === 2, `ends at ${retried.final}`);
check("and does nothing for the one that did not", retriedSilently.final === 1,
  `ends at ${retriedSilently.final} - there was nothing to retry, because nobody was told`);

say("\n== 6. the atomicity claim is checked by running it, not by reading it");
for (const name of store.mediaNames()) {
  const { module } = store.resolveMedium(name);
  const handle = module.make({ dir: tempDir() });
  const steps = handle.writeSteps("k", '{"n":1}');
  const claimsAtomic = module.GUARANTEES.includes("atomic-replace");
  check(`${name}: declared atomic-replace=${claimsAtomic}, write takes ${steps.length} step(s)`,
    claimsAtomic === (steps.length === 1),
    claimsAtomic ? "one step means nothing can be scheduled inside it" : "two steps, and it says so");
}
// The drill: a medium that claimed atomicity and wrote in two steps must be
// caught by the line above, or that line is a label agreeing with a label.
const liar = { GUARANTEES: ["atomic-replace"], writeSteps: () => [() => {}, () => {}] };
check("a medium claiming atomic-replace with a two-step write would be caught",
  liar.GUARANTEES.includes("atomic-replace") !== (liar.writeSteps().length === 1),
  "declared true, measured two steps");
// And the torn medium is observably torn: schedule something between its steps.
const torn = store.resolveMedium("torn-file").module.make({ dir: tempDir() });
const tornSteps = torn.writeSteps("k", '{"n":123456}');
tornSteps[0]();
const halfway = torn.read("k");
tornSteps[1]();
check("and torn-file is observably torn halfway through a write",
  halfway !== torn.read("k") && halfway.length < torn.read("k").length,
  `halfway: ${JSON.stringify(halfway)}`);

say("\n== 7. what this example does not solve");
say("        MEASURABLE, NOT MEASURED");
say("          - what retries cost under real contention");
say("          - how often a real application's writes actually overlap");
say("        NOT MEASURABLE HERE");
say("          - whether the schedules here cover what a real scheduler produces.");
say("            Two are written down. A system with more steps has more of them,");
say("            and nothing in this example enumerates that space.");
say("          - whether compare-and-set is the right repair. It converts a lost");
say("            update into a retry, which is a different problem, not none.");

say(failures.length ? `\n${failures.length} failure(s)` : "\nall checks passed");
for (const f of failures) say(`  - ${f}`);
process.exit(failures.length ? 1 : 0);
