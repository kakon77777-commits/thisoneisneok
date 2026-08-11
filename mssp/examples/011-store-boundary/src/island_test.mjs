// The island test.
//
//   node src/island_test.mjs
//
// Section 3 is the one this example exists for: the assertions an ordinary
// suite writes about a store pass under BOTH handout strategies. Section 4 is
// the one that caught me while writing it - an in-process read cannot tell a
// store from a cache, and the memory medium is here as the control that proves
// the check can come out false.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as store from "./SMS/store.mjs";
import * as jsonDir from "./TMS/media/json_dir.mjs";
import * as memory from "./TMS/media/memory.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const CONTRACT = JSON.parse(fs.readFileSync(path.join(here, "FMS", "contract.json"), "utf8"));
const MEDIA = { memory, "json-dir": jsonDir };
const failures = [];

const check = (label, ok, detail = "") => {
  process.stdout.write(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` - ${detail}` : ""}\n`);
  if (!ok) failures.push(label);
};
const say = (line = "") => process.stdout.write(`${line}\n`);
const tempDir = () => fs.mkdtempSync(path.join(os.tmpdir(), "mssp-011-"));
// A factory, not a constant. A shared literal would be mutated by the
// live-references section and quietly break every section after it - which
// is the hazard this example is about, met while writing the test for it.
const order = () => ({ id: "ord-1", items: [{ sku: "widget", qty: 2 }], total: 2 });

function opened(mediumName, handout, dir) {
  const medium = MEDIA[mediumName].make({ dir });
  return store.openStore({ medium, handout }).store;
}

say("\n== 1. every medium is an island and declares what it is");
const mediaDir = path.join(here, "TMS", "media");
const files = fs.readdirSync(mediaDir).filter((n) => n.endsWith(".mjs")).sort();
check("there are two medium files", files.length === 2, files.join(", "));
for (const file of files) {
  const source = fs.readFileSync(path.join(mediaDir, file), "utf8");
  const reaches = [...source.matchAll(/^\s*import[^"']*["']([^"']+)["']/gm)].map((m) => m[1]);
  const siblings = reaches.filter((spec) => /\.\.\/|FMS|SCL|SMS|DMS/.test(spec));
  check(`${file} reaches no sibling set`, siblings.length === 0,
    reaches.join(", ") || "no imports at all");
}
for (const [name, module] of Object.entries(MEDIA)) {
  check(`${name} declares MEDIUM and whether it survives the process`,
    module.MEDIUM === name && typeof module.PERSISTS_ACROSS_PROCESSES === "boolean",
    `persists=${module.PERSISTS_ACROSS_PROCESSES}`);
}

say("\n== 2. the medium is swappable, and an unknown one stops the run");
const results = {};
for (const name of Object.keys(MEDIA)) {
  const orders = opened(name, "copies", tempDir());
  orders.put(order());
  results[name] = JSON.stringify({ keys: orders.keys(), record: orders.get("ord-1") });
}
check("both media give the store identical observable results",
  new Set(Object.values(results)).size === 1, `${Object.keys(results).join(" vs ")}`);
// The drill: if that comparison cannot come out false, it proves nothing.
const brokenMedium = { read: () => null, write: () => {}, keys: () => [] };
const broken = store.openStore({ medium: brokenMedium, handout: "copies" }).store;
broken.put(order());
check("a medium that drops writes makes that comparison fail",
  JSON.stringify({ keys: broken.keys(), record: broken.get("ord-1") }) !== results.memory,
  "so section 2 is a measurement, not a formality");
check("an unknown handout id stops the run",
  Boolean(store.openStore({ medium: memory.make({}), handout: "live-refs" }).problem),
  store.openStore({ medium: memory.make({}), handout: "live-refs" }).problem);

say("\n== 3. the value assertions an ordinary suite writes pass under BOTH strategies");
const observed = {};
for (const handout of ["copies", "live-references"]) {
  const orders = opened("memory", handout, tempDir());
  orders.put(order());
  const record = orders.get("ord-1");
  observed[handout] = {
    values: [
      record.id === "ord-1",
      record.total === 2,
      record.items.length === 1,
      record.items[0].sku === "widget",
      JSON.stringify(orders.keys()) === '["ord-1"]',
    ],
    identity: store.handsOutCopies(orders, "ord-1"),
  };
  // the second observation: mutate what you were handed, then read again
  const handed = orders.get("ord-1");
  handed.items.push({ sku: "smuggled", qty: 99 });
  observed[handout].afterMutation = orders.get("ord-1").items.length;
}
const valueChecks = observed.copies.values.length;
check(`all ${valueChecks} value assertions pass under copies`,
  observed.copies.values.every(Boolean));
check(`all ${valueChecks} pass under live-references too`,
  observed["live-references"].values.every(Boolean),
  "which is the finding: they cannot tell the two apart");
check("identity separates them",
  observed.copies.identity !== observed["live-references"].identity,
  `copies=${observed.copies.identity}, live-references=${observed["live-references"].identity}`);
check("so does mutating what you were handed and reading again",
  observed.copies.afterMutation !== observed["live-references"].afterMutation,
  `${observed.copies.afterMutation} item(s) vs ${observed["live-references"].afterMutation}`);
say("        Two observations separate them and neither is about values. The");
say("        mutation one only fires if the test knew to mutate; the identity");
say("        one is one line and fires whether anyone thought of it or not.");

say("\n== 4. an in-process read cannot tell a store from a cache");
const diskDir = tempDir();
opened("json-dir", "copies", diskDir).put(order());
const memoryDir = tempDir();
const inMemory = opened("memory", "copies", memoryDir);
inMemory.put(order());
check("in this process, both media read the record back",
  Boolean(opened("json-dir", "copies", diskDir).get("ord-1")) && Boolean(inMemory.get("ord-1")),
  "and one of them stores nothing at all");
const dumpOf = (dir) => {
  try {
    return JSON.parse(execFileSync(process.execPath,
      [path.join(here, "main.mjs"), "--dump", dir], { encoding: "utf8" }));
  } catch { return {}; }
};
const fromDisk = dumpOf(diskDir);
const fromMemory = dumpOf(memoryDir);
check("a separate process finds the json-dir record", Boolean(fromDisk["ord-1"]),
  `${Object.keys(fromDisk).length} record(s)`);
check("and finds nothing the memory medium 'stored'", Object.keys(fromMemory).length === 0,
  `${Object.keys(fromMemory).length} record(s)`);
check("the two media disagree only once a second process asks",
  Boolean(fromDisk["ord-1"]) !== Boolean(fromMemory["ord-1"]),
  "the in-process check above passed for both");

say("\n== 5. fail closed");
const unknown = store.openStore({ medium: memory.make({}), handout: "whatever" });
check("an unresolvable handout returns a problem and no store",
  Boolean(unknown.problem) && unknown.store === undefined);
const strict = opened("memory", "copies", tempDir());
for (const [label, record] of [
  ["a record with no id", { items: [], total: 0 }],
  ["a total that disagrees with the items", { id: "x", items: [{ sku: "a", qty: 2 }], total: 5 }],
  ["a fractional quantity", { id: "x", items: [{ sku: "a", qty: 1.5 }], total: 1.5 }],
]) {
  const outcome = strict.put(record);
  check(`${label} is refused`, !outcome.written, outcome.problems[0]);
}
check("and nothing was written by any of them", strict.keys().length === 0,
  `${strict.keys().length} key(s)`);

say("\n== 6. what this example does not solve");
say("        MEASURABLE, NOT MEASURED");
say("          - what copying costs on a record large enough to care");
say("          - how often callers really mutate what a store handed them");
say("        NOT MEASURABLE HERE");
say("          - whether copies are the right default. A store handing out live");
say("            references is a correct design when its callers know; the defect");
say("            is being silent about which one you are. FMS is where that goes.");
say("          - concurrency. One process, one writer. Two writers would break");
say("            this store and nothing here would notice.");

say(failures.length ? `\n${failures.length} failure(s)` : "\nall checks passed");
for (const f of failures) say(`  - ${f}`);
process.exit(failures.length ? 1 : 0);
