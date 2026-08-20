// Probes that run the real compiler. Nothing here is simulated — every row in
// the report is a `cargo build` that actually happened.
//
// One thing about the instrument got it wrong the first time and is worth
// keeping in the source: cargo writes diagnostics to STDERR and exits 0 on a
// warning, and the return value of execFileSync is stdout only — so the first
// version of this file reported "no warning" for every route that compiled.
// spawnSync hands back both streams whatever the exit status.
//
// I also wrote down a second cause — that a shared package name under a shared
// target directory would let a cached unit answer silently — and it is NOT
// real. A mutation reinstating it stayed green, and measuring it directly
// showed why: a no-op `Finished` build REPLAYS the cached diagnostics. Section
// 2 of the island test measures that rather than asserting it. Each probe still
// gets its own package name, which costs nothing and keeps the probes
// independent of that behaviour either way.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const ROOT = fs.mkdtempSync(path.join(os.tmpdir(), "mssp-020-"));
const SHARED_TARGET = path.join(ROOT, "target");
let crateCounter = 0;

export const PRELUDE = 'fn fallible() -> Result<i32, String> { Err("broke".into()) }';

export function versions() {
  const rustc = spawnSync("rustc", ["--version"], { encoding: "utf8" });
  const cargo = spawnSync("cargo", ["--version"], { encoding: "utf8" });
  return `${(rustc.stdout ?? "").trim()} | ${(cargo.stdout ?? "").trim()}`;
}

export function available() {
  const probe = spawnSync("cargo", ["--version"], { encoding: "utf8" });
  return probe.status === 0;
}

// Build one crate and report what the compiler said. `deny` puts the lint
// setting in the CONSUMER's crate, which is where it lives in real code.
export function build(body, { deny = false } = {}) {
  crateCounter += 1;
  const dir = fs.mkdtempSync(path.join(ROOT, "crate-"));
  return buildIn(dir, body, { deny, name: `probe${crateCounter}` });
}

// Split out so the island test can write a crate once and then build it TWICE,
// which is the only way to see what a cached build reports. Writing the source
// again gives it a new mtime and forces a recompile — which is what the first
// version of this probe did, so it never saw a cache hit at all.
export function buildIn(dir, body, { deny = false, name = "probe" } = {}) {
  fs.mkdirSync(path.join(dir, "src"), { recursive: true });
  fs.writeFileSync(path.join(dir, "Cargo.toml"),
    `[package]\nname = "${name}"\nversion = "0.1.0"\nedition = "2021"\n`);
  fs.writeFileSync(path.join(dir, "src", "main.rs"),
    `${deny ? "#![deny(unused_must_use)]\n" : ""}${PRELUDE}\nfn main() {\n${body}\n}\n`);
  return rebuild(dir);
}

// Run cargo against a crate already on disk, touching nothing.
export function rebuild(dir) {
  const result = spawnSync("cargo", ["build", "--target-dir", SHARED_TARGET],
    { cwd: dir, encoding: "utf8" });
  const text = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  return {
    compiles: result.status === 0,
    exitStatus: result.status,
    recompiled: /Compiling/.test(text),
    mustUseWarning: /warning: unused `Result` that must be used/.test(text),
    denied: /error: unused `Result` that must be used/.test(text),
    errorCode: (text.match(/error\[([A-Z0-9]+)\]/) ?? [])[1] ?? null,
  };
}

// The challenge: a route claims whether the compiler FORCES the Err case to be
// named. The compiler answers. This is example 020's shape with rustc as the
// oracle — and, as there, the claim is checked by running it.
export function challenge(route) {
  const plain = build(route.BODY);
  const strict = build(route.BODY, { deny: true });
  const forced = plain.compiles === false && plain.errorCode !== null;
  return {
    route: route.NAME,
    claimed: route.CLAIMS_COMPILER_FORCES_HANDLING,
    plain,
    strict,
    forced,
    passed: forced === route.CLAIMS_COMPILER_FORCES_HANDLING,
  };
}

export function cleanup() {
  fs.rmSync(ROOT, { recursive: true, force: true });
}
