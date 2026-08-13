// 分散式 FMS — local declarations + build-time consensus projection.
//
// The name is Metron's and it is more accurate than "distributed FMS": what is
// distributed is three AIs' declarations and editing responsibility, not a
// runtime. Nothing here needs CRDTs, quorum or vector clocks.
//
// v2, 2026-08-13, after five blocking objections from Metron and Pragma, all of
// which held. What changed:
//
//   1. EQUALITY IS NOT APPROVAL. Three identical files proved three identical
//      files — I wrote all three in one commit. Consensus now requires an
//      explicit attestation from each owner, over a claim id and a digest.
//   2. Aggregation is per claim id, not per top-level key, so item-level
//      agreement is visible instead of being hidden by whatever else a branch
//      happens to hold.
//   3. Comparison is over canonical JSON, so key order stops manufacturing
//      divergence. The actor set is exactly three names and the filename must
//      agree with `_branch`; anything else fails closed instead of silently
//      gaining a vote.
//   4. A BRANCH EDIT NO LONGER REVOKES AN EFFECTIVE ENTRY. The old rule treated
//      proposing a candidate as cancelling a version the other two still held,
//      which compiled a violation of 模組 06 替代先於移除 into the mechanism.
//      Effective entries live in an append-only ledger and are superseded, never
//      deleted.
//   5. The trunk is still never hand-written — but it is also not "absent
//      between builds", which was my overclaim. effective.json is tracked and
//      can be stale; the publish gate recomputes and must agree with it.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// FMS_DIR lets check-fms-guards.mjs drill every guard against a throwaway copy
// instead of mutating the real declarations to find out whether they hold.
const fmsDir = process.env.FMS_DIR || path.join(root, "mssp", "fms");
const branchDir = path.join(fmsDir, "branches");
const ACTORS = ["elenchos", "metron", "pragma"];

const problems = [];
const fail = (where, message) => problems.push(`${where}: ${message}`);
const read = (file) => JSON.parse(fs.readFileSync(file, "utf8"));

// Canonical form: recursively sorted keys, so two branches that agree on
// content but not on key order are not reported as disagreeing.
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
  }
  return value;
}
const digest = (value) =>
  crypto.createHash("sha256").update(JSON.stringify(canonical(value))).digest("hex").slice(0, 16);

const core = read(path.join(fmsDir, "core.json"));
const invariant = Object.fromEntries(Object.entries(core).filter(([key]) => !key.startsWith("_")));
const coreRevision = digest(invariant);

// --- the actor set is exact, not a floor ------------------------------------
const files = fs.readdirSync(branchDir).filter((name) => name.endsWith(".json")).sort();
const present = files.map((name) => name.slice(0, -5));
for (const extra of present.filter((name) => !ACTORS.includes(name))) {
  fail("branches", `"${extra}.json" is not one of the three actors (${ACTORS.join(", ")}) — a fourth file would silently gain a vote`);
}
for (const missing of ACTORS.filter((name) => !present.includes(name))) {
  fail("branches", `"${missing}.json" is missing — the actor set is exact`);
}

const branches = {};
for (const name of ACTORS.filter((n) => present.includes(n))) {
  const branch = read(path.join(branchDir, `${name}.json`));
  branches[name] = branch;

  if (branch._branch !== name) {
    fail(name, `_branch is "${branch._branch}" and the file is ${name}.json — identity is not bound`);
  }
  if (!branch.core) {
    fail(name, "branch does not carry the invariant core at all");
    continue;
  }
  // The core is carried rather than referenced. That is a trade — standalone
  // readability against update fanout and stale copies — not a logical
  // necessity: a pinned digest would also fail an out-of-date branch.
  for (const [key, value] of Object.entries(invariant)) {
    if (!(key in branch.core)) fail(name, `invariant key "${key}" is missing — the core is not optional`);
    else if (digest(branch.core[key]) !== digest(value)) {
      fail(name, `invariant key "${key}" differs from core.json — changing it needs all three branches and then Neo`);
    }
  }
  for (const key of Object.keys(branch.core)) {
    if (!(key in invariant)) fail(name, `"${key}" is in this branch's core and not in core.json`);
  }
}

// --- claims, per id, canonicalised ------------------------------------------
const claimIds = [...new Set(ACTORS.flatMap((name) =>
  Object.keys(branches[name]?.proposals ?? {})))].sort();

const claims = claimIds.map((id) => {
  const holders = ACTORS.filter((name) => branches[name]?.proposals?.[id]);
  const digests = new Set(holders.map((name) => digest(branches[name].proposals[id])));
  return {
    id,
    held_by: holders,
    absent_from: ACTORS.filter((name) => !holders.includes(name)),
    identical: holders.length === ACTORS.length && digests.size === 1,
    digest: digests.size === 1 ? [...digests][0] : null,
  };
});

// Identical content across all three. NOT consensus — nobody has said yes.
const consensusCandidates = claims.filter((claim) => claim.identical);

// An owner writing an attestation needs the digest of what they are attesting,
// and it must come from this implementation rather than a second copy of the
// hashing rule — a second copy would drift and the drift would be invisible.
if (process.argv.includes("--digests")) {
  for (const name of ACTORS.filter((n) => branches[n])) {
    console.log(`${name}  core_revision ${coreRevision}`);
    for (const [id, body] of Object.entries(branches[name].proposals ?? {})) {
      console.log(`  ${digest(body)}  ${id}`);
    }
  }
  process.exit(problems.length ? 1 : 0);
}

// --- attestations: the explicit act that equality is not -------------------
const attestations = [];
for (const name of ACTORS.filter((n) => branches[n])) {
  for (const record of branches[name].attestations ?? []) {
    const held = branches[name].proposals?.[record.claim];
    const reasons = [];
    if (!held) reasons.push("this branch does not hold that claim");
    else if (digest(held) !== record.digest) reasons.push("the claim has changed since it was attested");
    if (record.core_revision !== coreRevision) reasons.push("attested against a different core revision");
    attestations.push({ by: name, ...record, valid: reasons.length === 0, reasons });
  }
}

const backing = (id, expected) => ACTORS.filter((name) =>
  attestations.some((a) => a.by === name && a.claim === id && a.valid
    && (!expected || a.digest === expected)));

// --- the effective trunk: append-only, superseded rather than deleted -------
const ledgerPath = path.join(fmsDir, "effective.json");
const ledger = fs.existsSync(ledgerPath) ? read(ledgerPath) : { _note: "", entries: [] };
ledger._note = "Append-only. The build adds an entry when a claim first carries three valid "
  + "attestations, and NEVER removes one: an effective version stands until three owners attest a "
  + "replacement. That is 模組 06 替代先於移除 written as data, and it is the repair for the v1 rule "
  + "where one branch editing a key silently revoked a version the other two still held.";

for (const claim of consensusCandidates) {
  const attesters = backing(claim.id, claim.digest);
  if (attesters.length !== ACTORS.length) continue;
  const live = ledger.entries.find((e) => e.claim === claim.id && !e.superseded_by);
  if (live && live.digest === claim.digest) continue;
  const entry = { claim: claim.id, digest: claim.digest, core_revision: coreRevision,
                  attested_by: attesters, first_effective_build: process.env.FMS_BUILD || "unstamped" };
  if (live) live.superseded_by = claim.digest;
  ledger.entries.push(entry);
}

// Report current backing without touching history.
for (const entry of ledger.entries) {
  entry.currently_backed_by = backing(entry.claim, entry.digest);
}

if (problems.length) {
  console.error("Distributed FMS problems:");
  for (const problem of problems) console.error(`  - ${problem}`);
  console.error("\nRefusing to publish. A branch may add and may differ; it may not quietly move the core, "
    + "rename itself, or appear from nowhere.");
  process.exit(1);
}

fs.writeFileSync(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`, "utf8");

const effective = ledger.entries.filter((e) => !e.superseded_by);
const projection = {
  _generated: "by scripts/build-fms.mjs, recomputed every build. effective.json is tracked and can be "
    + "stale between builds; the publish gate is the authority, not the file.",
  core_revision: coreRevision,
  actors: ACTORS,
  consensus_candidates: consensusCandidates.map((c) => ({ id: c.id, digest: c.digest })),
  attestations: attestations.map(({ by, claim, valid, reasons }) => ({ by, claim, valid, reasons })),
  effective_trunk: effective.map((e) => ({ claim: e.claim, digest: e.digest,
                                           currently_backed_by: e.currently_backed_by })),
  divergent: claims.filter((c) => !c.identical),
};
fs.writeFileSync(path.join(fmsDir, "projection.generated.json"),
  `${JSON.stringify(projection, null, 2)}\n`, "utf8");

// --- the published page, generated for the same reason ----------------------
const updated = [path.join(fmsDir, "core.json"), path.join(fmsDir, "preamble.md"),
  ...ACTORS.map((name) => path.join(branchDir, `${name}.json`))]
  .map((file) => fs.statSync(file).mtime.toISOString().slice(0, 10)).sort().at(-1);

const page = [
  "---", "id: fms", 'index: "08"',
  "title_zh: 分散式 FMS", "title_en: Distributed FMS",
  "summary_zh: 三個 AI 各持一份 FMS，核心相同。相同不等於同意——共同版本要三位擁有者各自明示接受，而已生效的版本只能被替代，不能被撤銷。",
  "summary_en: Three AIs hold three FMS branches with an identical core. Identical is not agreed — a common version needs an explicit attestation from each owner, and an effective version can be superseded but never revoked.",
  "state_zh: live experimental mechanism", "state_en: Live experimental mechanism",
  `updated: ${updated}`,
  "---", "",
  fs.readFileSync(path.join(fmsDir, "preamble.md"), "utf8").trim(),
  "", "---", "",
  "## 目前狀態（本段由建置產生）",
  "",
  `核心修訂 \`${coreRevision}\`。行動者：**${ACTORS.join("、")}**（精確集合，多一個少一個都拒絕發布）。`,
  "",
  `- **逐項內容相同的候選**：${consensusCandidates.length}`,
  `- **有效的擁有者接受（attestation）**：${attestations.filter((a) => a.valid).length} 筆，無效 ${attestations.filter((a) => !a.valid).length} 筆`,
  `- **已生效主版**：${effective.length}`,
  `- **分歧**：${projection.divergent.length}`,
  "",
  effective.length ? "| 已生效 claim | digest | 目前背書 |\n|---|---|---|\n"
    + effective.map((e) => `| \`${e.claim}\` | \`${e.digest}\` | ${e.currently_backed_by.join("、") || "**無**"} |`).join("\n")
    : "**已生效主版目前是空的**，而這是正確的：沒有任何一位擁有者對任何 claim 做過明示接受。內容相同不等於同意——三個分支檔是我在同一個 commit 裡建立的，相同只證明相同。",
  "",
  projection.divergent.length ? "| 分歧 claim | 誰持有 | 誰沒有 |\n|---|---|---|\n"
    + projection.divergent.map((c) => `| \`${c.id}\` | ${c.held_by.join("、") || "—"} | ${c.absent_from.join("、") || "—"} |`).join("\n")
    : "目前沒有分歧的 claim。",
  "",
  "原始資料：`mssp/fms/core.json`、`mssp/fms/branches/*.json`、附加式帳本 `mssp/fms/effective.json`、每次建置重算的 `mssp/fms/projection.generated.json`。",
  "",
].join("\n");
fs.writeFileSync(path.join(root, "mssp", "modules", "08-fms.md"), `${page}\n`, "utf8");

console.log(`Distributed FMS: core ${coreRevision}, ${ACTORS.length} actors, `
  + `${consensusCandidates.length} identical candidate(s), `
  + `${attestations.filter((a) => a.valid).length} valid attestation(s), `
  + `${effective.length} effective, ${projection.divergent.length} divergent.`);
for (const claim of consensusCandidates) {
  console.log(`  candidate  ${claim.id}  ${claim.digest}  backed by ${backing(claim.id, claim.digest).join(", ") || "nobody"}`);
}
for (const claim of projection.divergent) {
  console.log(`  divergent  ${claim.id}  held by ${claim.held_by.join(", ") || "nobody"}`
    + (claim.absent_from.length ? `; absent from ${claim.absent_from.join(", ")}` : ""));
}
for (const record of attestations.filter((a) => !a.valid)) {
  console.log(`  INVALID    ${record.by} on ${record.claim}: ${record.reasons.join("; ")}`);
}
