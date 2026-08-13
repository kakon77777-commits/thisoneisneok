// Every guard in build-fms.mjs, drilled against a throwaway copy.
//
// Written the same day the guards were, because yesterday's version of this
// mechanism shipped with a governance violation inside it and the way that was
// found was somebody else running it. A guard nobody has watched fail is a
// claim.
//
//   node scripts/check-fms-guards.mjs
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "mssp", "fms");
const builder = path.join(root, "scripts", "build-fms.mjs");
const failures = [];
// Captured before anything runs, so "this runner changed nothing" is a
// measurement rather than an intention.
const moduleBefore = fs.readFileSync(path.join(root, "mssp", "modules", "08-fms.md"), "utf8");
const ledgerBefore = fs.readFileSync(path.join(source, "effective.json"), "utf8");

const check = (label, ok, detail = "") => {
  process.stdout.write(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` - ${detail}` : ""}\n`);
  if (!ok) failures.push(label);
};

function sandbox(mutate) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "fms-guard-"));
  fs.cpSync(source, dir, { recursive: true });
  const branch = (name) => path.join(dir, "branches", `${name}.json`);
  const load = (name) => JSON.parse(fs.readFileSync(branch(name), "utf8"));
  const save = (name, value) => fs.writeFileSync(branch(name), `${JSON.stringify(value, null, 2)}\n`, "utf8");
  mutate({ dir, branch, load, save });
  try {
    const stdout = execFileSync(process.execPath, [builder],
      { env: { ...process.env, FMS_DIR: dir }, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    return { code: 0, out: stdout, dir };
  } catch (error) {
    return { code: error.status ?? 1, out: `${error.stdout ?? ""}${error.stderr ?? ""}`, dir };
  }
}

process.stdout.write("\n== the actor set is exact, not a floor\n");
let run = sandbox(({ dir }) =>
  fs.writeFileSync(path.join(dir, "branches", "someone-else.json"),
    JSON.stringify({ _branch: "someone-else", core: {} }), "utf8"));
check("a fourth branch file is refused", run.code !== 0 && /not one of the three actors/.test(run.out),
  run.out.trim().split("\n").find((l) => l.includes("actors"))?.trim());
run = sandbox(({ dir }) => fs.rmSync(path.join(dir, "branches", "pragma.json")));
check("a missing branch is refused", run.code !== 0 && /is missing/.test(run.out),
  run.out.trim().split("\n").find((l) => l.includes("missing"))?.trim());
run = sandbox(({ load, save }) => { const b = load("metron"); b._branch = "elenchos"; save("metron", b); });
check("a filename that disagrees with _branch is refused",
  run.code !== 0 && /identity is not bound/.test(run.out),
  run.out.trim().split("\n").find((l) => l.includes("identity"))?.trim());

process.stdout.write("\n== the core may be added to, not moved\n");
run = sandbox(({ load, save }) => {
  const b = load("metron"); b.core.sibling_rule = "siblings are fine actually"; save("metron", b);
});
check("a branch that edits an invariant key is refused",
  run.code !== 0 && /differs from core\.json/.test(run.out),
  run.out.trim().split("\n").find((l) => l.includes("differs"))?.trim());

process.stdout.write("\n== key order is not disagreement\n");
const claim = { title: "a test claim", status: "candidate", why: "to drill canonicalisation" };
const reordered = { why: claim.why, title: claim.title, status: claim.status };
run = sandbox(({ load, save }) => {
  for (const [name, body] of [["elenchos", claim], ["metron", claim], ["pragma", reordered]]) {
    const b = load(name); b.proposals = { ...(b.proposals ?? {}), drill_claim: body }; save(name, b);
  }
});
check("three branches holding the same claim in different key order agree",
  run.code === 0 && /1 identical candidate/.test(run.out),
  run.out.trim().split("\n")[0]);

process.stdout.write("\n== identical content is NOT approval\n");
check("and three identical claims with no attestation stay out of the effective trunk",
  run.code === 0 && /0 effective/.test(run.out), run.out.trim().split("\n")[0]);

process.stdout.write("\n== an attestation is bound to what was read\n");
run = sandbox(({ load, save }) => {
  const b = load("elenchos");
  b.proposals.fms_should_get_smaller.why = "edited after the attestation was written";
  save("elenchos", b);
});
check("editing a claim invalidates its own author's attestation",
  /INVALID .*fms_should_get_smaller.*changed since it was attested/.test(run.out),
  run.out.trim().split("\n").find((l) => l.includes("INVALID"))?.trim());
run = sandbox(({ load, save }) => {
  const b = load("elenchos");
  b.decisions[0].core_revision = "0000000000000000";
  save("elenchos", b);
});
check("an attestation against another core revision is invalid",
  /INVALID .*different core revision/.test(run.out),
  run.out.trim().split("\n").find((l) => l.includes("INVALID"))?.trim());

process.stdout.write("\n== the one that matters: an effective entry is superseded, never revoked\n");
// Objection 4. In v1, one branch editing a key removed it from the trunk, which
// treated proposing a candidate as cancelling a version the other two held.
const attestAll = ({ load, save }) => {
  for (const name of ["elenchos", "metron", "pragma"]) {
    const b = load(name);
    b.proposals = { ...(b.proposals ?? {}), drill_claim: claim };
    save(name, b);
  }
};
const dirWithClaim = sandbox(attestAll).dir;
const digestOf = execFileSync(process.execPath, [builder, "--digests"],
  { env: { ...process.env, FMS_DIR: dirWithClaim }, encoding: "utf8" })
  .split("\n").find((line) => line.includes("drill_claim"))?.trim().split(/\s+/)[0];
const coreRevision = execFileSync(process.execPath, [builder, "--digests"],
  { env: { ...process.env, FMS_DIR: dirWithClaim }, encoding: "utf8" })
  .split("\n")[0].trim().split(/\s+/).at(-1);

const withThreeAttestations = ({ load, save }) => {
  attestAll({ load, save });
  for (const name of ["elenchos", "metron", "pragma"]) {
    const b = load(name);
    b.decisions = [...(b.decisions ?? []),
      { id: `${name}-drill-a1`, kind: "attest", claim: "drill_claim",
        digest: digestOf, core_revision: coreRevision }];
    save(name, b);
  }
};
run = sandbox(withThreeAttestations);
check("three attestations over one claim make it effective",
  run.code === 0 && /1 effective/.test(run.out), run.out.trim().split("\n")[0]);

// Now edit one branch's copy. Under v1 the key left the trunk immediately.
const effectiveDir = sandbox(withThreeAttestations).dir;
const b = JSON.parse(fs.readFileSync(path.join(effectiveDir, "branches", "pragma.json"), "utf8"));
b.proposals.drill_claim = { ...claim, why: "pragma is now proposing something else" };
fs.writeFileSync(path.join(effectiveDir, "branches", "pragma.json"), JSON.stringify(b, null, 2), "utf8");
const after = execFileSync(process.execPath, [builder],
  { env: { ...process.env, FMS_DIR: effectiveDir }, encoding: "utf8" });
const ledger = JSON.parse(fs.readFileSync(path.join(effectiveDir, "effective.json"), "utf8"));
const entry = ledger.entries.find((e) => e.claim === "drill_claim");
// Derived state moved out of the ledger on 2026-08-13, because calling the file
// append-only while rewriting `superseded_by` and `currently_backed_by` into
// existing entries was a name disagreeing with the behaviour — Pragma's point.
// This drill caught the move itself, which is the only reason it is worth having.
const projectionAfter = JSON.parse(
  fs.readFileSync(path.join(effectiveDir, "projection.generated.json"), "utf8"));
const row = projectionAfter.effective_trunk.find((e) => e.claim === "drill_claim");
check("one branch proposing a change does NOT remove the effective entry",
  Boolean(entry) && row?.status === "live" && /1 effective/.test(after),
  after.trim().split("\n")[0]);
check("the ledger entry itself carries no derived state",
  entry.currently_backed_by === undefined && entry.superseded_by === undefined,
  Object.keys(entry).join(", "));
check("and the report shows its backing has weakened instead",
  row.currently_backed_by.length === 2 && row.backing_state === "contested",
  `${row.backing_state}, backed by ${row.currently_backed_by.join(", ")}`);

process.stdout.write("\n== withdrawal is an event, not a flag on the old one\n");
// Metron and Pragma specified this independently and identically, which is why
// it is here rather than the Board host's mutable `withdrawn: true`.
// The entry has to be effective BEFORE the withdrawal, or this measures nothing:
// a claim that never reached three attestations was never activated, and its
// absence afterwards says nothing about whether a withdrawal revokes anything.
// The first drill of this was written that way and correctly came out red.
{
  const dir = sandbox(withThreeAttestations).dir;
  const branch = JSON.parse(fs.readFileSync(path.join(dir, "branches", "pragma.json"), "utf8"));
  branch.decisions.push({ id: "pragma-drill-w1", kind: "withdraw", target: "pragma-drill-a1" });
  fs.writeFileSync(path.join(dir, "branches", "pragma.json"), JSON.stringify(branch, null, 2), "utf8");
  const out = execFileSync(process.execPath, [builder],
    { env: { ...process.env, FMS_DIR: dir }, encoding: "utf8" });
  check("a withdrawal leaves the already-effective entry live",
    /1 effective/.test(out), out.trim().split("\n")[0]);
  const projection = JSON.parse(fs.readFileSync(path.join(dir, "projection.generated.json"), "utf8"));
  const withdrawnRow = projection.effective_trunk.find((e) => e.claim === "drill_claim");
  check("history axis says live, state axis says contested",
    withdrawnRow?.status === "live" && withdrawnRow?.backing_state === "contested",
    `${withdrawnRow?.status} / ${withdrawnRow?.backing_state} / ${withdrawnRow?.currently_backed_by.join(", ")}`);
  const original = projection.decisions.find((d) => d.id === "pragma-drill-a1");
  check("the withdrawn attestation is still recorded rather than edited",
    original?.kind === "attest" && original?.withdrawn === true,
    original ? `withdrawn=${original.withdrawn}` : "gone");
}
run = sandbox(({ load, save }) => {
  const branch = load("pragma");
  branch.decisions = [{ id: "pragma-w0", kind: "withdraw", target: "elenchos-a1" }];
  save("pragma", branch);
});
check("a withdrawal aimed at another owner's attestation is invalid",
  /not an attestation in this owner/.test(run.out),
  run.out.split("\n").find((l) => l.includes("withdraw"))?.trim() || "(not reported)");

process.stdout.write("\n== the ledger is not self-authorising\n");
// Pragma injected an entry that was never proposed and had no attestations, and
// the builder called it effective with exit 0.
for (const [label, extra] of [
  ["an entry with no adopted body", {}],
  ["an entry whose body does not hash to its digest", { body: { x: 1 } }],
]) {
  const injected = sandbox(({ dir }) => {
    const file = path.join(dir, "effective.json");
    const ledger = JSON.parse(fs.readFileSync(file, "utf8"));
    ledger.entries.push({ claim: "a-claim-nobody-ever-proposed", digest: "deadbeefdeadbeef",
      core_revision: "0", attested_by: ["elenchos", "metron", "pragma"], ...extra });
    fs.writeFileSync(file, JSON.stringify(ledger, null, 2), "utf8");
  });
  check(`${label} is refused`, injected.code !== 0 && /nobody-ever-proposed/.test(injected.out),
    injected.out.split("\n").find((l) => l.includes("nobody-ever-proposed"))?.trim());
}

process.stdout.write("\n== this runner does not touch the canonical tree\n");
check("module 08 is byte-identical to before this run",
  fs.readFileSync(path.join(root, "mssp", "modules", "08-fms.md"), "utf8") === moduleBefore);
check("the canonical ledger is byte-identical to before this run",
  fs.readFileSync(path.join(source, "effective.json"), "utf8") === ledgerBefore);

process.stdout.write(failures.length ? `\n${failures.length} failure(s)\n` : "\nall guards drilled\n");
for (const f of failures) process.stdout.write(`  - ${f}\n`);
process.exit(failures.length ? 1 : 0);
