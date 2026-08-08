// 虛擬錨點 — a comparable profile across MSSP structurings.
//
//   node mssp/anchor/anchor.mjs
//   node mssp/anchor/anchor.mjs --json
//
// Neo, 2026-08-08: when the three of us are unsure whether a change to MSSP is
// an improvement, the fallback is not a vote — it is to ask which MSSP is
// actually better, and point at something.
//
// This is that something, and the first thing it has to do is refuse to be a
// score. 範例 007 measured that "better" is relative to a stated purpose: the
// same six modules split into four structural and two not, and one module moved
// across the line when the purpose was reworded and nothing else changed. A
// weighted sum would bury exactly that decision inside a coefficient nobody
// argues about. So this prints axes, and every axis says which way is better and
// what it cannot see.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const examplesDir = path.join(here, "..", "examples");

const IGNORED_DIRS = new Set(["__pycache__", ".pytest_cache", "node_modules", "target", ".mypy_cache"]);
const IGNORED_FILES = /\.(pyc|pyo|class|o)$/;
const SETS = ["FMS", "SCL", "SMS", "TMS", "DMS"];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) walk(path.join(dir, entry.name), out);
    } else if (!IGNORED_FILES.test(entry.name)) {
      out.push(path.join(dir, entry.name));
    }
  }
  return out;
}

const lines = (file) => fs.readFileSync(file, "utf8").split("\n").length;
const isSource = (file) => /\.(js|mjs|ts|py|rs)$/.test(file);

/** A TMS unit: a directory carrying an index/manifest, otherwise a single file. */
const INDEX_FILES = ["index.js", "index.mjs", "index.ts", "__init__.py", "Cargo.toml"];
function tmsUnits(tmsDir) {
  if (!fs.existsSync(tmsDir)) return [];
  const files = walk(tmsDir).filter(isSource);
  const roots = new Map();
  for (const file of files) {
    let unit = file;
    let cursor = path.dirname(file);
    while (cursor.startsWith(tmsDir)) {
      if (INDEX_FILES.some((name) => fs.existsSync(path.join(cursor, name)))) unit = cursor;
      cursor = path.dirname(cursor);
    }
    if (!roots.has(unit)) roots.set(unit, []);
    roots.get(unit).push(file);
  }
  // A package __init__.py with nothing in it is not a unit of its own.
  return [...roots.entries()]
    .map(([root, members]) => ({ root, members }))
    .filter((u) => u.members.some((f) => lines(f) > 1));
}

/** How many lines you must load to exercise one unit, following local imports. */
function loadCost(entryFiles, srcDir) {
  const seen = new Set();
  const queue = [...entryFiles];
  let total = 0;
  while (queue.length) {
    const file = queue.pop();
    if (seen.has(file) || !fs.existsSync(file)) continue;
    seen.add(file);
    total += lines(file);
    const source = fs.readFileSync(file, "utf8");
    const specs = [
      ...[...source.matchAll(/^\s*(?:import|export)\s[^;]*?\sfrom\s+["']([^"']+)["']/gm)].map((m) => m[1]),
      ...[...source.matchAll(/^\s*import\s+["']([^"']+)["']/gm)].map((m) => m[1]),
      ...[...source.matchAll(/^\s*from\s+([.\w]+)\s+import\b/gm)].map((m) => m[1]),
    ];
    for (const spec of specs) {
      let target = null;
      if (spec.startsWith(".") && !/^\.+\w/.test(spec) && /[/\\]/.test(spec) === false && spec.includes(".") === false) {
        target = null;
      }
      if (spec.startsWith("./") || spec.startsWith("../")) {
        target = path.resolve(path.dirname(file), spec);
      } else if (/^[A-Z]{3}(\.|$)/.test(spec)) {
        target = path.join(srcDir, spec.replaceAll(".", path.sep));
      } else if (spec.startsWith(".")) {
        const up = spec.match(/^\.+/)[0].length;
        let base = path.dirname(file);
        for (let i = 1; i < up; i += 1) base = path.dirname(base);
        const rest = spec.slice(up).replaceAll(".", path.sep);
        target = rest ? path.join(base, rest) : base;
      }
      if (!target) continue;
      for (const candidate of [target, `${target}.js`, `${target}.mjs`, `${target}.py`,
                               path.join(target, "index.js"), path.join(target, "__init__.py")]) {
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) { queue.push(candidate); break; }
      }
    }
  }
  return { lines: total, files: seen.size };
}

/** Where the "no unit references a sibling" rule is actually enforced. */
function enforcement(srcDir, language) {
  const hasCargo = walk(srcDir).some((f) => path.basename(f) === "Cargo.toml");
  if (hasCargo) return { level: 3, how: "manifest + compiler" };
  if (language === "rust") return { level: 2, how: "compiler only" };
  return { level: 1, how: "source text match" };
}

function profile(id) {
  const dir = path.join(examplesDir, id);
  const srcDir = path.join(dir, "src");
  const meta = fs.readFileSync(path.join(dir, "meta.yaml"), "utf8");
  const language = (meta.match(/^language:\s*(\S+)/m) ?? [])[1] ?? "?";

  const all = walk(srcDir);
  const source = all.filter(isSource);
  const total = source.reduce((n, f) => n + lines(f), 0);

  const bySet = {};
  for (const set of SETS) {
    const files = walk(path.join(srcDir, set)).filter(isSource);
    // Metron: this counted SOURCE files, so an FMS holding only manifest.json
    // read as unused, and one example scored 5 sets purely for having an empty
    // FMS/__init__.py. That measures file extensions, not MSSP sets.
    const anyFile = walk(path.join(srcDir, set)).filter((f) => lines(f) > 1);
    bySet[set] = { files: files.length, lines: files.reduce((n, f) => n + lines(f), 0), present: anyFile.length > 0 };
  }

  const units = tmsUnits(path.join(srcDir, "TMS"));
  const costs = units.map((u) => loadCost(u.members, srcDir));
  const worst = costs.length ? Math.max(...costs.map((c) => c.lines)) : 0;

  return {
    id,
    language,
    total_source_lines: total,
    tms_units: units.length,
    worst_unit_load_lines: worst,
    isolation_ratio: worst ? Number((total / worst).toFixed(1)) : null,
    sms_share_pct: total ? Math.round((bySet.SMS.lines / total) * 100) : 0,
    sets_used: SETS.filter((s) => bySet[s].present).length,
    enforcement: enforcement(srcDir, language),
  };
}

const AXES = [
  { key: "isolation_ratio", label: "isolation  total ÷ worst unit", better: "higher",
    cannot_see: "whether the unit is worth loading at all" },
  { key: "worst_unit_load_lines", label: "worst unit load (lines)", better: "lower",
    cannot_see: "how often that unit is the one you need" },
  { key: "total_source_lines", label: "total source lines", better: "lower",
    cannot_see: "how much of it is comment carrying the reasoning" },
  { key: "sms_share_pct", label: "SMS share of source (%)", better: "lower",
    cannot_see: "whether those lines are structural — that needs a witness, see 範例 007" },
  { key: "tms_units", label: "TMS units", better: "neither",
    cannot_see: "nothing here says more or fewer is right" },
];

const ids = fs.readdirSync(examplesDir)
  .filter((d) => fs.existsSync(path.join(examplesDir, d, "meta.yaml")))
  .sort();
const rows = ids.map(profile);

if (process.argv.includes("--json")) {
  process.stdout.write(JSON.stringify({ axes: AXES, rows }, null, 2) + "\n");
  process.exit(0);
}

const w = (s, n) => String(s).padEnd(n);
console.log("\n== 虛擬錨點 — MSSP structurings, side by side");
console.log("   STATUS: experimental measurement prototype (Metron's review, 2026-08-08).");
console.log("   It shows which axes are worth measuring. It cannot yet adjudicate which");
console.log("   structuring is better, and no method change should rest on it.");
console.log("   Known measurement defects still open: Python's empty TMS/__init__.py merges");
console.log("   submodules into one unit, and Rust `use`/Cargo edges are not followed by");
console.log("   loadCost — so `units` and `worst` are not comparable across languages.\n");
console.log(`  ${w("example", 24)}${w("lang", 11)}${w("lines", 7)}${w("units", 7)}${w("worst", 7)}${w("ratio", 7)}${w("SMS%", 6)}${w("sets", 6)}enforcement`);
console.log(`  ${"-".repeat(94)}`);
for (const r of rows) {
  console.log(`  ${w(r.id, 24)}${w(r.language, 11)}${w(r.total_source_lines, 7)}${w(r.tms_units, 7)}` +
              `${w(r.worst_unit_load_lines, 7)}${w(r.isolation_ratio ?? "-", 7)}${w(r.sms_share_pct, 6)}` +
              `${w(r.sets_used, 6)}${r.enforcement.how}`);
}

console.log("\n== per axis, and what each axis cannot see\n");
for (const axis of AXES) {
  const values = rows.map((r) => r[axis.key]).filter((v) => v !== null);
  let best = "—";
  if (axis.better !== "neither" && values.length) {
    const target = axis.better === "higher" ? Math.max(...values) : Math.min(...values);
    best = rows.filter((r) => r[axis.key] === target).map((r) => r.id).join(", ");
  }
  console.log(`  ${w(axis.label, 32)}${w(axis.better, 9)}${best}`);
  console.log(`  ${w("", 32)}cannot see: ${axis.cannot_see}`);
}

// An anchor whose axes move together gives a false impression of independent
// evidence. The first run of this file had one example winning all four scored
// axes, which is not a result about that example — two of the axes are
// algebraically linked (ratio = total ÷ worst), and the rest track size. So the
// anchor reports its own axis independence before anyone reads the table.
// Metron, 2026-08-08: the first version used the 1 - 6Σd²/n(n²-1) shortcut with
// dense ranks and no tie handling. SMS% has two 27s, so the shortcut does not
// apply and the numbers were wrong — and I had quoted one of them (rho 0) as
// the measurement that corrected me. Average ranks, and Pearson over the ranks,
// which is the definition rather than the shortcut.
function spearman(a, b) {
  const rank = (xs) => {
    const order = [...xs].map((v, i) => [v, i]).sort((p, q) => p[0] - q[0]);
    const r = new Array(xs.length);
    let i = 0;
    while (i < order.length) {
      let j = i;
      while (j + 1 < order.length && order[j + 1][0] === order[i][0]) j += 1;
      const average = (i + j + 2) / 2; // ranks are 1-based
      for (let k = i; k <= j; k += 1) r[order[k][1]] = average;
      i = j + 1;
    }
    return r;
  };
  const ra = rank(a); const rb = rank(b); const n = a.length;
  const mean = (xs) => xs.reduce((s, v) => s + v, 0) / n;
  const ma = mean(ra); const mb = mean(rb);
  let num = 0; let da = 0; let db = 0;
  for (let i = 0; i < n; i += 1) {
    num += (ra[i] - ma) * (rb[i] - mb);
    da += (ra[i] - ma) ** 2;
    db += (rb[i] - mb) ** 2;
  }
  if (da === 0 || db === 0) return 0;
  return Number((num / Math.sqrt(da * db)).toFixed(2));
}

console.log("\n== how independent are these axes, really\n");
const scored = AXES.filter((a) => a.better !== "neither").map((a) => a.key);
const pairs = [];
for (let i = 0; i < scored.length; i += 1) {
  for (let j = i + 1; j < scored.length; j += 1) {
    const x = rows.map((r) => r[scored[i]] ?? 0);
    const y = rows.map((r) => r[scored[j]] ?? 0);
    pairs.push([scored[i], scored[j], spearman(x, y)]);
  }
}
pairs.sort((p, q) => Math.abs(q[2]) - Math.abs(p[2]));
for (const [x, y, rho] of pairs) {
  const flag = Math.abs(rho) >= 0.8 ? "  <- these two are not independent evidence" : "";
  console.log(`  ${w(x, 24)}${w(y, 24)}rho ${String(rho).padStart(6)}${flag}`);
}
const dependent = pairs.filter(([, , rho]) => Math.abs(rho) >= 0.8).length;
console.log(`\n  ${dependent} of ${pairs.length} axis pairs move together at |rho| >= 0.8.`);
if (dependent) {
  console.log("  The dependent pair is the one that had to be: isolation_ratio IS total ÷ worst,");
  console.log("  so it can never be independent evidence alongside either of them. It stays");
  console.log("  because the ratio is the readable number, but it counts as one axis with");
  console.log("  worst_unit_load_lines, not two.");
  console.log("");
  console.log("  My first reading of this table was that every axis just tracks size. The");
  console.log("  measurement disagrees: total_source_lines and sms_share_pct come out at");
  console.log("  rho 0, so a structuring can be large with a small SMS or the reverse. The");
  console.log("  overlap is narrower than it looked, and I would have shipped the wider");
  console.log("  claim if this section had not been computed.");
}

console.log(`
== what this anchor refuses to do

  It does not produce a score, and that refusal is the load-bearing part.

  範例 007 measured that "better" is relative to a stated purpose: six modules
  split four/two under one witness, and one module crossed the line when the
  witness was reworded and nothing else changed. A weighted sum would put that
  decision inside a coefficient nobody argues about, and the argument is the
  point.

  So: no total, no ranking, and every axis carries what it cannot see.
  A structuring that wins four rows and loses one has lost a row, and the
  reader is the one who decides whether that row mattered.

== axes this anchor does not have yet

  identity consistency   needs each example to state a witness; only 範例 007 does
  check discrimination   needs each check instrumented for "could this fail"
  change containment     needs a history of changes, not a snapshot
`);
