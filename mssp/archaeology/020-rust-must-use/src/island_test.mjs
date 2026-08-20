// The island test, run against the real compiler.
//
//   node src/island_test.mjs
//
// Section 2 checks the INSTRUMENT, because this entry's first version read only
// stdout, where cargo writes no diagnostics at all. It also measures the cache
// claim I wrote down beside that one and could not reproduce: a cached build
// replays its warnings, so the hazard I described does not exist.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as compiler from "./SMS/compiler.mjs";
import * as bareCall from "./TMS/routes/bare_call.mjs";
import * as directAssign from "./TMS/routes/direct_assign.mjs";
import * as explicitDiscard from "./TMS/routes/explicit_discard.mjs";
import * as matchArm from "./TMS/routes/match_arm.mjs";
import * as unwrap from "./TMS/routes/unwrap.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const FMS = JSON.parse(fs.readFileSync(path.join(here, "FMS", "architecture.json"), "utf8"));
const POLICY = JSON.parse(fs.readFileSync(path.join(here, "SCL", "policy.json"), "utf8"));
const ROUTES = [bareCall, explicitDiscard, unwrap, directAssign, matchArm];
const failures = [];
let ran = 0;
const check = (label, ok, detail = "") => {
  ran += 1;
  process.stdout.write(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` - ${detail}` : ""}\n`);
  if (!ok) failures.push(label);
};
const say = (line = "") => process.stdout.write(`${line}\n`);

if (!compiler.available()) {
  say("\n  REFUSED: no rust toolchain. This entry measures a compiler and will not guess.");
  process.exit(1);
}
say(`\n  ${compiler.versions()}`);

say("\n== 1. each route is an island, and FMS matches the tree");
for (const [unit, declared] of Object.entries(FMS.units)) {
  const dir = path.join(here, ...unit.split("/"));
  const onDisk = fs.readdirSync(dir).filter((n) => n.endsWith(".mjs")).sort();
  check(`${unit}: FMS declares what is on disk`,
    JSON.stringify(onDisk) === JSON.stringify([...declared].sort()),
    `disk ${onDisk.join(", ")} | FMS ${[...declared].sort().join(", ")}`);
  for (const file of onDisk) {
    const body = fs.readFileSync(path.join(dir, file), "utf8");
    check(`${unit}/${file} imports nothing at all`, !/^\s*import\s/m.test(body));
  }
}
check("every route states what it claims about the compiler",
  ROUTES.every((r) => typeof r.CLAIMS_COMPILER_FORCES_HANDLING === "boolean"));

say("\n== 2. the instrument, checked before anything is measured with it");
const first = compiler.build(bareCall.BODY);
check("a route known to warn does report the warning", first.mustUseWarning === true,
  "cargo writes diagnostics to stderr and exits 0 - reading only stdout loses every one");
check("and it did exit 0 while doing so", first.exitStatus === 0);
// Measured rather than assumed. I first wrote down a second instrument defect -
// that a cached unit would answer silently - and a mutation reinstating it
// stayed GREEN. This is what is actually true, and it is why that hazard does
// not exist here.
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "mssp-020-cache-"));
const fresh = compiler.buildIn(dir, bareCall.BODY, { name: "cacheprobe" });
const cached = compiler.rebuild(dir);   // same crate, source untouched
check("building the same directory twice really does hit the cache the second time",
  fresh.recompiled === true && cached.recompiled === false,
  `first ${fresh.recompiled ? "Compiling" : "Finished"}, second ${cached.recompiled ? "Compiling" : "Finished"}`);
check("and the cached build REPLAYS the warning rather than going quiet",
  cached.mustUseWarning === true,
  "so a shared package name is not a hazard here - the claim I first wrote down was wrong");
fs.rmSync(dir, { recursive: true, force: true });
check("a route known NOT to warn reports no warning",
  compiler.build(matchArm.BODY).mustUseWarning === false);
check("so the warning column can take both values", first.mustUseWarning !== compiler.build(matchArm.BODY).mustUseWarning);
const broken = compiler.build("    this is not rust;");
check("and a build that cannot compile is reported as such", broken.compiles === false);

say("\n== 3. the control - handling written out compiles clean");
const control = compiler.build(matchArm.BODY);
check("match names the Err arm and compiles", control.compiles === true);
check("with no must-use warning", control.mustUseWarning === false);
check("and no error code", control.errorCode === null);
const discard = compiler.build(explicitDiscard.BODY);
check("let _ = ... also compiles clean with no warning",
  discard.compiles === true && discard.mustUseWarning === false);
check("so 'compiles clean' is reached by handling AND by discarding",
  control.compiles === discard.compiles && control.mustUseWarning === discard.mustUseWarning,
  "which is why the control has to be here - without it, clean would be evidence of nothing");

say("\n== 4. extraction is forced, discarding is not");
const assign = compiler.build(directAssign.BODY);
check("using the T without naming Err does not compile", assign.compiles === false);
check("and the error is a type error, not a lint", assign.errorCode === "E0308", assign.errorCode ?? "-");
check("while dropping the whole value compiles", compiler.build(bareCall.BODY).compiles === true);
check("and discarding it explicitly compiles without even a warning",
  discard.compiles === true && discard.mustUseWarning === false);
const unwrapped = compiler.build(unwrap.BODY);
check("unwrap_or names Err by method call and compiles clean",
  unwrapped.compiles === true && unwrapped.mustUseWarning === false);

say("\n== 5. and the loudest setting the consumer has does not close it");
const denyBare = compiler.build(bareCall.BODY, { deny: true });
const denyDiscard = compiler.build(explicitDiscard.BODY, { deny: true });
check("deny(unused_must_use) turns the bare call into an error", denyBare.compiles === false);
check("and it names the lint, not a type", denyBare.denied === true && denyBare.errorCode === null);
check("but let _ = ... still compiles under the same setting", denyDiscard.compiles === true);
check("with nothing said about it at all",
  denyDiscard.mustUseWarning === false && denyDiscard.denied === false);
check("so the setting moves one row and not the other",
  denyBare.compiles !== compiler.build(bareCall.BODY).compiles
  && denyDiscard.compiles === discard.compiles);
check("which puts the decision back on the consumer - 改良點 16, inside a type system",
  POLICY.lint_setting === "deny(unused_must_use)");

say("\n== 6. the challenge - each route's claim against the compiler");
for (const route of ROUTES) {
  const result = compiler.challenge(route);
  check(`${route.NAME}: claims forced=${result.claimed}, compiler says ${result.forced}`,
    result.passed === true);
}
const liar = { NAME: "drill-liar", BODY: explicitDiscard.BODY, CLAIMS_COMPILER_FORCES_HANDLING: true };
const drilled = compiler.challenge(liar);
check("DRILL: a route claiming the compiler forces it, when it does not, is caught",
  drilled.passed === false);

say("\n== 7. what this does not settle");
check("#[must_use] is doing real work - the bare call is the one row that moves",
  first.mustUseWarning === true && discard.mustUseWarning === false);
check("SCL names the gap rather than implying coverage",
  POLICY.what_this_cannot_reach.includes("let _ = fallible()"));
check("and this entry measures one type in one language on one toolchain",
  FMS.non_goals.some((g) => /one toolchain|single language|other languages/i.test(g)),
  "the claim is demonstrated on rustc 1.96, not established for type systems in general");

compiler.cleanup();
say("");
if (failures.length > 0) {
  say(`  ${failures.length} FAILED: ${failures.join(" | ")}`);
  process.exitCode = 1;
} else {
  say(`  ${ran} checks passed - every row is a cargo build that really ran`);
}
