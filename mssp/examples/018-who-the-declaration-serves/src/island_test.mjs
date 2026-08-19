// The island test.
//
//   node src/island_test.mjs
//
// Section 2 is the control that makes everything after it mean something.
// Section 4 is the finding. Section 6 proves the contradiction check reads SCL
// rather than a constant.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as pipeline from "./SMS/pipeline.mjs";
import * as policy from "./SCL/policy.mjs";
import * as honestPage from "./TMS/sources/honest_page.mjs";
import * as silentPage from "./TMS/sources/silent_page.mjs";
import * as refuseDeclared from "./TMS/policies/refuse_declared.mjs";
import * as retryDeclared from "./TMS/policies/retry_declared.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const CONTRACT = JSON.parse(fs.readFileSync(path.join(here, "FMS", "contract.json"), "utf8"));
const failures = [];
let ran = 0;
const check = (label, ok, detail = "") => {
  ran += 1;
  process.stdout.write(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` - ${detail}` : ""}\n`);
  if (!ok) failures.push(label);
};
const say = (line = "") => process.stdout.write(`${line}\n`);

const { sources, policies, problems } = pipeline.load();
const incentiveUnder = (module, name) => pipeline.incentive(module, sources, name);

say("\n== 1. every unit is an island, and FMS matches the tree");
check("loading raised no problems", problems.length === 0, problems.join("; "));
for (const [unit, declared] of Object.entries(CONTRACT.units)) {
  const dir = path.join(here, ...unit.split("/"));
  const onDisk = fs.readdirSync(dir).filter((n) => n.endsWith(".mjs")).sort();
  check(`${unit}: FMS declares what is on disk`,
    JSON.stringify(onDisk) === JSON.stringify([...declared].sort()),
    `disk ${onDisk.join(", ")} | FMS ${[...declared].sort().join(", ")}`);
  for (const file of onDisk) {
    const body = fs.readFileSync(path.join(dir, file), "utf8");
    const siblings = onDisk.filter((n) => n !== file).map((n) => n.replace(/\.mjs$/, ""));
    check(`${unit}/${file} reaches no sibling`,
      !siblings.some((s) => new RegExp(`from\\s+["'][^"']*${s}`).test(body)));
    check(`${unit}/${file} reaches no other set`,
      !/from\s+["'][^"']*\/(SMS|DMS|SCL|FMS)\//.test(body));
  }
}

say("\n== 2. the control - two units that differ only in the declaration");
check("honest-page and silent-page hold the same number of records",
  honestPage.HELD === silentPage.HELD, `${honestPage.HELD} and ${silentPage.HELD}`);
for (const budget of [1, 2, 3]) {
  check(`at budget ${budget} they hand over the same number`,
    honestPage.collect({ budget }).records.length === silentPage.collect({ budget }).records.length,
    `${honestPage.collect({ budget }).records.length}`);
}
check("and at budget 1 exactly one of them declares",
  Boolean(honestPage.collect({ budget: 1 }).incomplete_because)
  !== Boolean(silentPage.collect({ budget: 1 }).incomplete_because));
check("so any difference between them is attributable to the declaration alone",
  honestPage.HELD === silentPage.HELD
  && honestPage.collect({ budget: 1 }).records.length === silentPage.collect({ budget: 1 }).records.length);

say("\n== 3. under refuse-declared, declaring costs the unit");
const refusedHonest = incentiveUnder(refuseDeclared, "honest-page");
const refusedSilent = incentiveUnder(refuseDeclared, "silent-page");
check("honest-page contributes nothing once it declares", refusedHonest.declared === 0);
check("and would have contributed 3 with the declaration suppressed", refusedHonest.suppressed === 3);
check("so the incentive is negative", refusedHonest.delta < 0, `${refusedHonest.delta}`);
check("the control moves by nothing", refusedSilent.delta === 0,
  `${refusedSilent.suppressed} -> ${refusedSilent.declared}`);
check("which is what says the machinery is not just moving numbers",
  refusedSilent.delta === 0 && refusedHonest.delta !== 0);

say("\n== 4. under retry-declared, the same declaration pays");
const retriedHonest = incentiveUnder(retryDeclared, "honest-page");
const retriedSilent = incentiveUnder(retryDeclared, "silent-page");
check("honest-page contributes 6 once it declares", retriedHonest.declared === 6);
check("and would have contributed 3 with the declaration suppressed", retriedHonest.suppressed === 3);
check("so the incentive is POSITIVE", retriedHonest.delta > 0, `+${retriedHonest.delta}`);
check("the control still moves by nothing", retriedSilent.delta === 0);
const applied = pipeline.through(retryDeclared, sources);
check("and the honest unit ends up AHEAD of the silent one holding identical data",
  pipeline.contribution(applied, "honest-page") > pipeline.contribution(applied, "silent-page"),
  `${pipeline.contribution(applied, "honest-page")} vs ${pipeline.contribution(applied, "silent-page")}`);
check("the same declaration points opposite ways under the two policies",
  Math.sign(refusedHonest.delta) === -Math.sign(retriedHonest.delta));
check("and neither policy withheld what it does with a declaration",
  Boolean(refuseDeclared.WHAT_IT_DOES_WITH_A_DECLARATION)
  && Boolean(retryDeclared.WHAT_IT_DOES_WITH_A_DECLARATION));

say("\n== 5. FMS's numbers are the run's numbers");
const fmsRefuse = CONTRACT.the_measurement.under_refuse_declared;
const fmsRetry = CONTRACT.the_measurement.under_retry_declared;
check("FMS's refuse-declared figures match the pipeline",
  fmsRefuse["honest-page"] === refusedHonest.delta && fmsRefuse["silent-page"] === refusedSilent.delta,
  `${JSON.stringify(fmsRefuse)} vs ${refusedHonest.delta}/${refusedSilent.delta}`);
check("FMS's retry-declared figures match the pipeline",
  fmsRetry["honest-page"] === retriedHonest.delta && fmsRetry["silent-page"] === retriedSilent.delta,
  `${JSON.stringify(fmsRetry)} vs ${retriedHonest.delta}/${retriedSilent.delta}`);

say("\n== 6. SCL states the assumption, and the check reads SCL");
const inForce = policies[policy.policyName()];
const measuredInForce = { source: "honest-page", ...incentiveUnder(inForce, "honest-page") };
check("the deployment in force is retry-declared", policy.policyName() === "retry-declared");
check("SCL writes down what it assumes", policy.assumption() === "self-penalising");
check("and the measurement contradicts it", policy.contradicts(measuredInForce) !== null,
  policy.contradicts(measuredInForce) ?? "");
check("a negative incentive does NOT contradict it",
  policy.contradicts({ source: "x", declared: 0, suppressed: 3, delta: -3 }) === null);
check("and neither does zero",
  policy.contradicts({ source: "x", declared: 3, suppressed: 3, delta: 0 }) === null);
check("the deployment calls a contradiction fatal", policy.isFatal());

say("\n== 7. the guards from 013 and 015 still hold");
const vouching = {
  NAME: "drill-vouch", CAN_FAIL_WITH: ["x"], HELD: 1, COMPLETE: true,
  collect: () => ({ records: [], incomplete_because: null }),
};
check("DRILL: a source declaring COMPLETE is still refused",
  pipeline.load([vouching]).problems.some((p) => /declares COMPLETE/.test(p)));
const mute = {
  NAME: "drill-mute", CAN_FAIL_WITH: [], HELD: 1,
  collect: () => ({ records: [], incomplete_because: null }),
};
check("DRILL: an empty CAN_FAIL_WITH is still refused",
  pipeline.load([mute]).problems.some((p) => /CAN_FAIL_WITH is empty/.test(p)));
const secretive = {
  POLICY: "drill-secretive",
  apply: (runs) => runs.map((r) => ({ ...r, kept: r.records, note: null })),
};
check("DRILL: a policy that will not say what it does with a declaration is refused",
  pipeline.load([], [secretive]).problems.some((p) => /does not say what it does/.test(p)));

say("\n== 8. what the measurement cannot do, asserted so it stays measured");
const neverDeclares = {
  NAME: "drill-never", CAN_FAIL_WITH: ["x"], HELD: 2,
  collect: () => ({ records: [{ from: "drill-never", id: "n-1" }], incomplete_because: null }),
};
const withExtra = pipeline.load([neverDeclares]);
const flat = pipeline.incentive(retryDeclared, withExtra.sources, "drill-never");
check("a unit that never declares measures as zero", flat.delta === 0,
  `${flat.suppressed} -> ${flat.declared}`);
check("and so does the control, so a zero reading does not say WHICH it is",
  flat.delta === refusedSilent.delta,
  "the limit named in FMS non_goals - if this goes red, the limit changed and the text must too");
check("nothing here reads intent - the reading is outcome only",
  !/\bintent\b|\bdeliberate\b|\bstrategic\b/
    .test(fs.readFileSync(path.join(here, "SMS", "pipeline.mjs"), "utf8")));
check("and the report never prints a delta without the pair it came from",
  /suppressed/.test(fs.readFileSync(path.join(here, "DMS", "report.mjs"), "utf8"))
  && /declared/.test(fs.readFileSync(path.join(here, "DMS", "report.mjs"), "utf8")));

say("");
if (failures.length > 0) {
  say(`  ${failures.length} FAILED: ${failures.join(" | ")}`);
  process.exitCode = 1;
} else {
  say(`  ${ran} checks passed - ${Object.keys(sources).length} sources, ${Object.keys(policies).length} policies`);
}
