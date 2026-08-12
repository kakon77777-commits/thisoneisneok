// 分散式 FMS: three branches, one derived trunk.
//
// Neo's direction, 2026-08-12: three AIs hold three FMS versions whose cores
// are the same; each may change and add; the trunk is the version all three
// pass; differences are allowed but not everything may be changed.
//
// The one design decision that is not his and is mine to defend: THE TRUNK IS
// COMPUTED, NEVER WRITTEN. A hand-written trunk would be a fourth declaration
// able to drift from all three branches, which is the defect this lab has spent
// a week on. Here the trunk cannot be stale, because it does not exist between
// builds.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fmsDir = path.join(root, "mssp", "fms");
const branchDir = path.join(fmsDir, "branches");

const problems = [];
const fail = (where, message) => problems.push(`${where}: ${message}`);
const read = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const stable = (value) => JSON.stringify(value);

const core = read(path.join(fmsDir, "core.json"));
const invariant = Object.fromEntries(
  Object.entries(core).filter(([key]) => !key.startsWith("_")));

const branchNames = fs.readdirSync(branchDir)
  .filter((name) => name.endsWith(".json")).map((name) => name.slice(0, -5)).sort();
if (branchNames.length < 3) {
  fail("branches", `expected three branches, found ${branchNames.length}: ${branchNames.join(", ")}`);
}

const branches = {};
for (const name of branchNames) {
  const branch = read(path.join(branchDir, `${name}.json`));
  branches[name] = branch;

  // The teeth behind 不能全部都改. A branch carries the core rather than
  // referencing it, precisely so that changing it is something a check can see.
  if (!branch.core) {
    fail(name, "branch does not carry the invariant core at all");
    continue;
  }
  for (const [key, value] of Object.entries(invariant)) {
    if (!(key in branch.core)) {
      fail(name, `invariant key "${key}" is missing — the core is not optional`);
    } else if (stable(branch.core[key]) !== stable(value)) {
      fail(name, `invariant key "${key}" differs from core.json — changing it needs all three branches and then Neo`);
    }
  }
  for (const key of Object.keys(branch.core)) {
    if (!(key in invariant)) fail(name, `"${key}" is in this branch's core and not in core.json`);
  }
}

// The trunk: every key present in EVERY branch with the same value. Keys
// beginning with "_" are each branch's own bookkeeping and never travel.
const trunkKeys = [];
const divergence = [];
if (branchNames.length) {
  const candidateKeys = new Set(branchNames.flatMap((name) =>
    Object.keys(branches[name]).filter((key) => !key.startsWith("_"))));
  for (const key of [...candidateKeys].sort()) {
    const holders = branchNames.filter((name) => key in branches[name]);
    const values = new Set(holders.map((name) => stable(branches[name][key])));
    if (holders.length === branchNames.length && values.size === 1) {
      trunkKeys.push(key);
    } else {
      divergence.push({
        key,
        held_by: holders,
        missing_from: branchNames.filter((name) => !holders.includes(name)),
        agree: values.size === 1,
      });
    }
  }
}

const trunk = Object.fromEntries(trunkKeys.map((key) => [key, branches[branchNames[0]][key]]));

if (problems.length) {
  console.error("Distributed FMS problems:");
  for (const problem of problems) console.error(`  - ${problem}`);
  console.error("\nRefusing to publish. A branch may add and may differ; it may not quietly move the core.");
  process.exit(1);
}

const generated = {
  _generated: "by scripts/build-fms.mjs. Never edit: it is recomputed every build and any edit is discarded.",
  _rule: "a key reaches the trunk when every branch holds it and they agree",
  branches: branchNames,
  trunk,
  divergence,
};
fs.writeFileSync(path.join(fmsDir, "trunk.generated.json"),
  `${JSON.stringify(generated, null, 2)}\n`, "utf8");

// The published page is generated too. A hand-written page quoting these
// numbers would start lying the next time a branch moves - the same reason the
// trunk is computed.
const rows = (list) => list.length ? list : ["（無）"];
const page = [
  "---",
  "id: fms",
  'index: "08"',
  "title_zh: 分散式 FMS",
  "title_en: Distributed FMS",
  "summary_zh: 三個 AI 各持一份 FMS，核心相同。主版是三個都通過的那一版，而且是每次建置算出來的，不是寫的。",
  "summary_en: Three AIs hold three FMS branches with an identical core. The trunk is what all three pass, and it is computed on every build rather than written.",
  "state_zh: 機制已生效",
  "state_en: Mechanism live",
  // Derived from the newest source file rather than from today, so a rebuild
  // that changed nothing does not produce a diff claiming it did.
  `updated: ${[path.join(fmsDir, "core.json"), path.join(fmsDir, "preamble.md"),
    ...branchNames.map((name) => path.join(branchDir, `${name}.json`))]
    .map((file) => fs.statSync(file).mtime.toISOString().slice(0, 10))
    .sort().at(-1)}`,
  "---",
  "",
  fs.readFileSync(path.join(fmsDir, "preamble.md"), "utf8").trim(),
  "",
  "---",
  "",
  "## 目前狀態（本段由建置產生）",
  "",
  `分支：**${branchNames.join("、")}**。主版鍵 **${trunkKeys.length}** 個，分歧 **${divergence.length}** 個。`,
  "",
  "| 鍵 | 在主版 | 誰持有 | 誰沒有 | 持有者是否一致 |",
  "|---|---|---|---|---|",
  ...trunkKeys.map((key) => `| \`${key}\` | **是** | 全部 | — | 是 |`),
  ...divergence.map((item) => `| \`${item.key}\` | 否 | ${rows(item.held_by).join("、")} | ${item.missing_from.join("、") || "—"} | ${item.agree ? "是" : "否"} |`),
  "",
  "一個鍵要進主版，條件是**每個分支都持有它，而且內容相同**。以 `_` 開頭的鍵是各分支自己的簿記，永遠不會進主版。",
  "",
  `原始資料：\`mssp/fms/core.json\`、\`mssp/fms/branches/*.json\`、推導結果 \`mssp/fms/trunk.generated.json\`。`,
  "",
].join("\n");
fs.writeFileSync(path.join(root, "mssp", "modules", "08-fms.md"), `${page}\n`, "utf8");

console.log(`Distributed FMS: ${branchNames.length} branches (${branchNames.join(", ")}), `
  + `${trunkKeys.length} key(s) in the trunk, ${divergence.length} divergent.`);
for (const key of trunkKeys) console.log(`  trunk      ${key}`);
for (const item of divergence) {
  console.log(`  divergent  ${item.key}  held by ${item.held_by.join(", ") || "nobody"}`
    + (item.missing_from.length ? `; absent from ${item.missing_from.join(", ")}` : "")
    + (item.held_by.length === branchNames.length && !item.agree ? "; all hold it and disagree" : ""));
}
