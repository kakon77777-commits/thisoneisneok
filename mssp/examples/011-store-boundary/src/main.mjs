// A store whose boundary is a term of the contract rather than a surprise.
//
//   node src/main.mjs              write, read back, and mutate what was handed over
//   node src/main.mjs --strict     exit 1 if the store hands out live references
//   node src/main.mjs --dump DIR   reopen a json-dir store and print it (used by the island test)
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as report from "./DMS/report.mjs";
import * as policy from "./SCL/policy.mjs";
import * as store from "./SMS/store.mjs";
import * as jsonDir from "./TMS/media/json_dir.mjs";
import * as memory from "./TMS/media/memory.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const CONTRACT = JSON.parse(fs.readFileSync(path.join(here, "FMS", "contract.json"), "utf8"));
const MEDIA = { memory, "json-dir": jsonDir };

export function resolveMedium(name, config) {
  const module = MEDIA[name];
  if (!module) {
    return { problem: `medium "${name}" has no implementation - fail closed (known: ${Object.keys(MEDIA).sort().join(", ")})` };
  }
  return { module, medium: module.make(config) };
}

const ORDERS = [
  { id: "ord-1001", items: [{ sku: "widget", qty: 2 }, { sku: "gasket", qty: 1 }], total: 3 },
  { id: "ord-1002", items: [{ sku: "widget", qty: 1 }], total: 1 },
  { id: "ord-1003", items: [{ sku: "widget", qty: 4 }], total: 9 },
];

function dump(dir) {
  const { medium } = resolveMedium("json-dir", { dir });
  const opened = store.openStore({ medium, handout: "copies" });
  const out = {};
  for (const key of opened.store.keys()) out[key] = opened.store.get(key);
  process.stdout.write(JSON.stringify(out));
  return 0;
}

function main(argv) {
  const out = (line = "") => process.stdout.write(`${line}\n`);
  const dumpAt = argv.indexOf("--dump");
  if (dumpAt !== -1) return dump(argv[dumpAt + 1]);

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "mssp-011-"));
  const { module, medium, problem } = resolveMedium(policy.medium(), { dir });
  if (problem) { out(`  !! ${problem}`); return 1; }

  const opened = store.openStore({ medium, handout: policy.handout() });
  if (opened.problem) { out(`  !! ${opened.problem}`); return 1; }
  const { store: orders } = opened;

  out(`\n== medium ${module.MEDIUM}, handout ${policy.handout()}`);
  out(`   persists across processes: ${module.PERSISTS_ACROSS_PROCESSES}`);

  out("\n== writing");
  report.written(ORDERS.map((record) => ({ record, outcome: orders.put(record) })), out);

  out("\n== reading back");
  report.readBack(orders, orders.keys(), out);

  out("\n== what happens to a mutation made through what the store handed over");
  const handed = orders.get("ord-1001");
  const before = handed.items.map((item) => item.sku);
  handed.items.push({ sku: "smuggled", qty: 99 });
  const after = orders.get("ord-1001").items.map((item) => item.sku);
  report.boundary("a later read of the same key", before, after, out);
  const separate = store.handsOutCopies(orders, "ord-1001");
  out(`\n    store.get(k) !== store.get(k):  ${separate}`);
  out(`    the contract says this store hands back: ${CONTRACT.handouts[policy.handout()].hands_back}`);
  out(`    ${separate
    ? "so the mutation went into a copy and the medium never saw it"
    : "so the mutation is visible to later readers here and was never written"}`);

  report.gaps(out);

  if (argv.includes("--strict") && !separate && policy.liveReferenceIsFatal()) return 1;
  return 0;
}

process.exitCode = main(process.argv.slice(2));
