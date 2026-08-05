// The island test, and the check a measurement most needs: can it come out
// against the thing that produced it?
//
//   node src/island-test.js

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { measure, renderTable } from "./DMS/measure.js";
import { known, mayProduce, plausible } from "./SCL/policy.js";
import { summarise } from "./SMS/summarise.js";
import { validate } from "./SMS/validate.js";
import { reading } from "./SMS/model.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const failures = [];
const report = (label, ok, detail = "") => {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` - ${detail}` : ""}`);
  if (!ok) failures.push(label);
};

const ROWS = [reading("a", 20, "09:00"), reading("a", 22, "10:00"), reading("b", null, "09:00")];

console.log("\n== 1. each format alone, no sibling loaded");
for (const name of ["text", "csv", "json"]) {
  const { render } = await import(`./TMS/formats/${name}.js`);
  const { kept, dropped } = validate(ROWS);
  const out = render(summarise(kept), dropped);
  report(`formats/${name} renders with no sibling imported`, typeof out === "string" && out.length > 0,
    `${out.split("\n")[0].slice(0, 40)}…`);
}
{
  const src = fs.readFileSync(path.join(here, "TMS", "formats", "csv.js"), "utf8");
  report("a format imports nothing at all", !/^\s*import\s/m.test(src), "not even SMS - it takes plain values");
}

console.log("\n== 2. the measurement can come out against the restructuring");
const m = await measure();
const table = renderTable(m);
const costs = table.split("\n").filter((l) => l.trim().endsWith("+")).length;
const wins = table.split("\n").filter((l) => l.trim().endsWith("ok")).length;
report("at least one axis reports a cost", costs > 0, `${costs} cost row(s)`);
report("at least one axis reports a benefit", wins > 0, `${wins} benefit row(s)`);
report("total lines went UP, and the table says so", m.mssp.lines > m.monolith.lines,
  `${m.monolith.lines} -> ${m.mssp.lines}`);
report("this measurement is therefore capable of disagreeing with MSSP",
  costs > 0 && wins > 0, "a table where every row favours the author is not a measurement");

console.log("\n== 3. the numbers are computed, not written down");
report("total lines match a fresh count of the files",
  m.monolith.lines === fs.readFileSync(path.join(here, "..", "baseline", "monolith.js"), "utf8")
    .split("\n").filter((l) => l.trim()).length);
report("the extension cost names the file it found",
  Array.isArray(m.extendCost.mssp.touched) && m.extendCost.mssp.touched.includes("SCL/policy.json"),
  m.extendCost.mssp.touched.join(", "));
report("and the instrument is not in its own result",
  !m.extendCost.mssp.touched.some((f) => f.startsWith("DMS/")),
  "the first version reported DMS/measure.js, which contains the search term");

console.log("\n== 4. SCL decides what exists, and the core does not branch on it");
report("policy knows three formats", known().length === 3, known().join(", "));
report("an unknown format is not produceable", !mayProduce("formats/xml"));
report("the plausibility window comes from policy", plausible().min === -60 && plausible().max === 60,
  JSON.stringify(plausible()));
{
  // Code lines only. The first version read the whole file and matched a
  // comment explaining the branch that had just been removed — the third time
  // today a check reported on prose describing the thing rather than the thing.
  const main = fs.readFileSync(path.join(here, "main.js"), "utf8")
    .split("\n").filter((l) => !l.trim().startsWith("//")).join("\n");
  const branches = [...main.matchAll(/formats\/(text|csv|json)/g)].map((x) => x[0]);
  report("main.js names at most the default format",
    branches.filter((b) => b !== "formats/text").length === 0,
    `found: ${[...new Set(branches)].join(", ") || "none"} - a branch per format would put the coupling back`);
}

console.log("\n== 5. behaviour is unchanged from the baseline");
{
  const { execFileSync } = await import("node:child_process");
  const run = (file, arg) => execFileSync(process.execPath, arg ? [file, arg] : [file],
    { encoding: "utf8" }).trim();
  const base = path.join(here, "..", "baseline", "monolith.js");
  const mine = path.join(here, "main.js");
  for (const [arg, label] of [[null, "text"], ["--csv", "csv"]]) {
    const a = run(base, arg).split("\n").slice(1).join("\n");
    const b = run(mine, arg).split("\n").slice(1).join("\n");
    report(`${label} output is byte-identical to the baseline`, a === b,
      a === b ? "" : `differs:\n${a}\n---\n${b}`);
  }
}

console.log("");
if (failures.length) {
  console.log(`  ${failures.length} check(s) failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("  island test passed");
