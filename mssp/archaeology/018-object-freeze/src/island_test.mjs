// The island test, run against the real built-ins.
//
//   node src/island_test.mjs
//
// Section 3 is the control. Section 3b is the drill: a mode that DECLARES it
// reports violations while swallowing them must be caught by running it.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as upstream from "./SMS/upstream.mjs";
import * as sloppy from "./TMS/modes/sloppy.mjs";
import * as strict from "./TMS/modes/strict.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const FMS = JSON.parse(fs.readFileSync(path.join(here, "FMS", "architecture.json"), "utf8"));
const POLICY = JSON.parse(fs.readFileSync(path.join(here, "SCL", "policy.json"), "utf8"));
const failures = [];
let ran = 0;
const check = (label, ok, detail = "") => {
  ran += 1;
  process.stdout.write(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` - ${detail}` : ""}\n`);
  if (!ok) failures.push(label);
};
const say = (line = "") => process.stdout.write(`${line}\n`);

say(`\n  ${upstream.runtime()}`);

say("\n== 1. each mode is an island, and FMS matches the tree");
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
check("both modes declare whether they report violations",
  [sloppy, strict].every((m) => typeof m.REPORTS_VIOLATIONS === "boolean"));
check("and how they are entered", [sloppy, strict].every((m) => Boolean(m.HOW_IT_IS_ENTERED)));

say("\n== 2. the same assignment against the same frozen object");
const viaSloppy = upstream.through(sloppy, upstream.frozen());
const viaStrict = upstream.through(strict, upstream.frozen());
check("sloppy raised nothing", viaSloppy.threw === null);
check("and the object kept its old value", viaSloppy.actual === 100);
check("but the expression evaluated to the new one", viaSloppy.returned === 999);
check("so `returned` and `actual` disagree about the same write",
  viaSloppy.returned !== viaSloppy.actual, `${viaSloppy.returned} vs ${viaSloppy.actual}`);
check("strict raised a TypeError for the identical line", /^TypeError/.test(viaStrict.threw ?? ""),
  viaStrict.threw ?? "");
check("and its object kept the old value too", viaStrict.actual === 100);
check("so the object agrees across modes and only the report differs",
  viaSloppy.actual === viaStrict.actual && (viaSloppy.threw === null) !== (viaStrict.threw === null));

say("\n== 3. the control - the same assignment against an object never frozen");
const openSloppy = upstream.through(sloppy, upstream.neverFrozen());
const openStrict = upstream.through(strict, upstream.neverFrozen());
check("it raises nothing under either mode", openSloppy.threw === null && openStrict.threw === null);
check("the write lands", openSloppy.actual === 999 && openStrict.actual === 999);
check("and it also returns 999 - the control", openSloppy.returned === 999);
check("so `returned` is the same in the success and in the silent failure",
  openSloppy.returned === viaSloppy.returned,
  `${openSloppy.returned} both times, actual ${openSloppy.actual} vs ${viaSloppy.actual}`);
check("which is what makes `returned` uninformative rather than merely wrong",
  openSloppy.returned === viaSloppy.returned && openSloppy.actual !== viaSloppy.actual);

say("\n== 3b. DRILL - a mode that overclaims must be caught by running it");
const liar = {
  MODE: "drill-liar",
  REPORTS_VIOLATIONS: true, // the declaration
  assign(target, key, value) { // the implementation, which swallows
    try { const returned = (target[key] = value); return { returned, threw: null, actual: target[key] }; }
    catch { return { returned: null, threw: null, actual: target[key] }; }
  },
};
check("the drill unit declares it reports violations", liar.REPORTS_VIOLATIONS === true);
check("running it says otherwise", upstream.reportsViolations(liar) === false);
check("so the declaration is refused", upstream.reportsViolations(liar) !== liar.REPORTS_VIOLATIONS);
check("and the honest declarations hold under the same probe",
  upstream.reportsViolations(sloppy) === sloppy.REPORTS_VIOLATIONS
  && upstream.reportsViolations(strict) === strict.REPORTS_VIOLATIONS);

say("\n== 4. the declarer was never given a way to say what a violation means");
check("Object.freeze takes one argument", upstream.freezeArity() === 1, `${upstream.freezeArity()}`);
check("and isFrozen answers the same under either mode", Object.isFrozen(upstream.frozen()));
check("so the object cannot tell which consumer it reached",
  FMS.modes.sloppy.how_it_is_entered.includes("none of which the declarer chose"));
check("the two entrances are different constructs, not a setting",
  sloppy.HOW_IT_IS_ENTERED !== strict.HOW_IT_IS_ENTERED);

say("\n== 5. the declaration is shallower than it reads");
const nested = upstream.nested();
check("the outer object is frozen", Object.isFrozen(nested));
check("the inner one is not", !Object.isFrozen(nested.inner));
const nestedStrict = strict.assign(nested.inner, "price", 999);
check("so a strict-mode write to the inner object raises nothing", nestedStrict.threw === null);
check("and it lands", nested.inner.price === 999);
check("which is a failure of the declaration, not of either mode",
  nestedStrict.threw === null && viaStrict.threw !== null);

say("\n== 6. what this does not change");
check("freezing is right - the object did keep its value under both modes",
  viaSloppy.actual === 100 && viaStrict.actual === 100);
check("sloppy mode cannot be fixed retroactively - it is what unmarked code means",
  sloppy.HOW_IT_IS_ENTERED.includes("classic script"));
check("SCL names what it cannot reach", POLICY.what_this_cannot_reach.includes("Function constructor"));
check("and this deployment does refuse", POLICY.a_silent_violation_is === "fatal");

say("");
if (failures.length > 0) {
  say(`  ${failures.length} FAILED: ${failures.join(" | ")}`);
  process.exitCode = 1;
} else {
  say(`  ${ran} checks passed - every probe ran the real built-ins`);
}
