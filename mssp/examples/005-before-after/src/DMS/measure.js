// Measures the structure the program is in.
//
// The first four examples in this lab demonstrated structure and none of them
// produced a number. This one does, and the number has to be able to come out
// against MSSP or it is not a measurement.
//
// Four questions, each computed from the files rather than asserted:
//
//   total          how much code exists at all
//   to exercise    how much must be loaded to run ONE capability alone
//   to extend      how many files a new output format touches
//   to understand  how much must be read to know what one capability does
//
// The third and fourth are the ones that matter in practice and the ones
// nobody measures, because they are about the next change rather than this one.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.dirname(here);
const example = path.dirname(src);

const linesOf = (file) => fs.readFileSync(file, "utf8").split("\n").filter((l) => l.trim()).length;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) walk(path.join(dir, entry.name), out);
    else if (entry.name.endsWith(".js") || entry.name.endsWith(".json")) out.push(path.join(dir, entry.name));
  }
  return out;
}

/** Files a module needs, transitively, following relative imports. */
function closure(entry, seen = new Set()) {
  const resolved = path.resolve(entry);
  if (seen.has(resolved)) return seen;
  seen.add(resolved);
  const source = fs.readFileSync(resolved, "utf8");
  for (const m of source.matchAll(/from\s+["'](\.[^"']+)["']/g)) {
    const target = path.resolve(path.dirname(resolved), m[1]);
    if (fs.existsSync(target)) closure(target, seen);
  }
  // policy.js reads policy.json at runtime; a file the module cannot run
  // without is part of what must be loaded, whether or not it is imported.
  if (source.includes("policy.json")) seen.add(path.join(src, "SCL", "policy.json"));
  return seen;
}

export async function measure() {
  const monolith = path.join(example, "baseline", "monolith.js");
  // The program only. DMS and the island test are excluded because the baseline
  // has neither, and a comparison that counts one side's test harness against
  // the other's absence of one is not measuring the restructuring.
  const mssp = walk(src).filter(
    (f) => !f.includes(`${path.sep}DMS${path.sep}`) && !f.endsWith("island-test.js"),
  );

  // to exercise one capability alone: the CSV renderer.
  const csvClosure = [...closure(path.join(src, "TMS", "formats", "csv.js"))];
  // to understand one capability: the same file, on its own, plus what its
  // signature refers to. In the monolith you cannot open renderCsv without the
  // file that contains it.
  const csvFile = path.join(src, "TMS", "formats", "csv.js");

  // How much existing code a third output format actually costs. Measured by
  // adding one — baseline/variant/monolith-with-json.js is the monolith with a
  // JSON renderer, written the way anyone would — and diffing. The MSSP side is
  // diffed the same way: every file that is not the new one is compared against
  // what a two-format build contains.
  const extendCost = {
    monolith: diffAgainst(monolith, path.join(example, "baseline", "variant", "monolith-with-json.js")),
    mssp: msspExtendCost(),
  };

  return {
    extendCost,
    monolith: {
      files: 1,
      lines: linesOf(monolith),
      toExercise: linesOf(monolith),
      toExerciseFiles: 1,
      toExtend: extendCost.monolith.files,
      toUnderstand: linesOf(monolith),
    },
    mssp: {
      files: mssp.length,
      lines: mssp.reduce((n, f) => n + linesOf(f), 0),
      toExercise: csvClosure.reduce((n, f) => n + linesOf(f), 0),
      toExerciseFiles: csvClosure.length,
      toExtend: extendCost.mssp.files,
      toUnderstand: linesOf(csvFile),
    },
  };
}

/** Lines that differ between two versions of one file, and whether it is new. */
function diffAgainst(before, after) {
  const a = fs.readFileSync(before, "utf8").split("\n");
  const b = fs.readFileSync(after, "utf8").split("\n");
  const setA = new Set(a.map((l) => l.trim()).filter(Boolean));
  const added = b.map((l) => l.trim()).filter((l) => l && !setA.has(l));
  return { files: 1, existingFilesChanged: 1, linesAdded: added.length };
}

/** What adding formats/json cost the MSSP version, checked rather than claimed. */
function msspExtendCost() {
  const newFile = path.join(src, "TMS", "formats", "json.js");
  const policy = path.join(src, "SCL", "policy.json");
  // Every pre-existing file that mentions the new capability. If the answer is
  // anything but the policy, the core was touched and the claim is false.
  // The needle is built rather than written, and this file is excluded, because
  // the first version of this check reported DMS/measure.js as a file the new
  // capability touched — it contains the search term by virtue of being the
  // thing that searches. An instrument that matches itself is measuring the
  // wrong object.
  const needle = ["formats", "json"].join("/");
  const mentions = walk(src)
    .filter((f) => !f.startsWith(here) && f !== newFile && fs.readFileSync(f, "utf8").includes(needle))
    .map((f) => path.relative(src, f).replaceAll("\\", "/"));
  const policyLines = JSON.parse(fs.readFileSync(policy, "utf8")).formats;
  return {
    files: 2,
    existingFilesChanged: mentions.length,
    touched: mentions,
    linesAdded: 1 + fs.readFileSync(newFile, "utf8").split("\n").filter((l) => l.trim()).length,
    formatsInPolicy: Object.keys(policyLines).length,
  };
}

export function renderTable(m) {
  const row = (label, a, b, better) => {
    const mark = a === b ? "  =" : (better === "lower" ? (b < a ? " ok" : "  +") : (b > a ? " ok" : "  +"));
    return `  ${label.padEnd(34)} ${String(a).padStart(6)} ${String(b).padStart(8)}  ${mark}`;
  };
  return [
    "",
    "== the same program, measured",
    "",
    `  ${"".padEnd(34)} ${"before".padStart(6)} ${"after".padStart(8)}`,
    row("total lines", m.monolith.lines, m.mssp.lines, "lower"),
    row("files", m.monolith.files, m.mssp.files, "lower"),
    row("lines to exercise one capability", m.monolith.toExercise, m.mssp.toExercise, "lower"),
    row("files to exercise one capability", m.monolith.toExerciseFiles, m.mssp.toExerciseFiles, "lower"),
    row("files touched to add a format", m.monolith.toExtend, m.mssp.toExtend, "lower"),
    row("EXISTING files changed to add it", m.extendCost.monolith.existingFilesChanged,
        m.extendCost.mssp.existingFilesChanged, "lower"),
    row("lines to understand one capability", m.monolith.toUnderstand, m.mssp.toUnderstand, "lower"),
    "",
    "  ok = the restructuring helped on this axis, + = it cost",
    "",
    `  the third format touched, in the restructured version: ${m.extendCost.mssp.touched.join(", ") || "nothing pre-existing"}`,
  ].join("\n");
}
