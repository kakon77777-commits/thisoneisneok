// The island test, run against the real built-ins.
//
//   node src/island_test.mjs
//
// Section 3b is the drill: a combinator that DECLARES it keeps what succeeded
// while being implemented with Promise.all must be caught by running it.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as upstream from "./SMS/upstream.mjs";
import * as all from "./TMS/combinators/all.mjs";
import * as allSettled from "./TMS/combinators/all_settled.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const FMS = JSON.parse(fs.readFileSync(path.join(here, "FMS", "architecture.json"), "utf8"));
const failures = [];
let ran = 0;
const check = (label, ok, detail = "") => {
  ran += 1;
  process.stdout.write(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` - ${detail}` : ""}\n`);
  if (!ok) failures.push(label);
};
const say = (line = "") => process.stdout.write(`${line}\n`);

say(`\n  ${upstream.runtime()}`);

say("\n== 1. each combinator is an island, and FMS matches the tree");
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
check("both combinators declare what they keep",
  [all, allSettled].every((m) => typeof m.KEEPS_WHAT_SUCCEEDED === "boolean"));

say("\n== 2. one member of four rejects");
const ranAll = [];
const viaAll = await all.combine(upstream.oneRejects(ranAll));
await upstream.wait(80);
check("Promise.all kept nothing", viaAll.kept.length === 0);
check("but all four members ran to completion", ranAll.length === 4, ranAll.join(","));
check("so three fulfilled values existed and none is reachable",
  ranAll.filter((n) => n !== "b").length === 3 && viaAll.kept.length === 0);
check("exactly one reason surfaced", viaAll.reasons.length === 1, viaAll.reasons.join(" | "));

const ranSettled = [];
const viaSettled = await allSettled.combine(upstream.oneRejects(ranSettled));
check("Promise.allSettled kept three values", viaSettled.kept.length === 3, viaSettled.kept.join(", "));
check("and surfaced the failure as well", viaSettled.reasons.length === 1, viaSettled.reasons.join(" | "));
check("the two disagree by three values on identical input",
  viaSettled.kept.length - viaAll.kept.length === 3);

say("\n== 3. the control - the same four members, nothing rejecting");
const cleanAll = await all.combine(upstream.noneReject([]));
const cleanSettled = await allSettled.combine(upstream.noneReject([]));
check("Promise.all keeps four", cleanAll.kept.length === 4);
check("Promise.allSettled keeps four - the control", cleanSettled.kept.length === 4);
check("with nothing rejecting they carry the same information",
  cleanAll.kept.length === cleanSettled.kept.length && cleanAll.reasons.length === cleanSettled.reasons.length);
check("so section 2's gap is about failure, not about the two functions",
  cleanSettled.kept.length - cleanAll.kept.length === 0 && viaSettled.kept.length - viaAll.kept.length === 3);

say("\n== 3b. DRILL - a combinator that overclaims must be caught by running it");
const liar = {
  COMBINATOR: "drill-liar",
  KEEPS_WHAT_SUCCEEDED: true, // the declaration
  async combine(promises) {   // the implementation, which does not
    try { return { kept: await Promise.all(promises), reasons: [] }; }
    catch (raised) { return { kept: [], reasons: [raised.message] }; }
  },
};
async function keepsWhatSucceeded(unit) {
  const ran = [];
  const result = await unit.combine(upstream.oneRejects(ran));
  await upstream.wait(80);
  return result.kept.length > 0 && ran.length > result.kept.length;
}
check("the drill unit declares it keeps what succeeded", liar.KEEPS_WHAT_SUCCEEDED === true);
check("running it says otherwise", (await keepsWhatSucceeded(liar)) === false);
check("so the declaration is refused", (await keepsWhatSucceeded(liar)) !== liar.KEEPS_WHAT_SUCCEEDED);
check("and the honest unit's declaration holds under the same probe",
  (await keepsWhatSucceeded(allSettled)) === allSettled.KEEPS_WHAT_SUCCEEDED);
check("as does Promise.all's", (await keepsWhatSucceeded(all)) === all.KEEPS_WHAT_SUCCEEDED);

say("\n== 4. removing the rejecting member gives more than keeping it");
const removed = await upstream.withAll(upstream.rejectingMemberRemoved);
const present = await upstream.withAll(upstream.oneRejects);
await upstream.wait(80);
check("removed (island test): three values", removed.values?.length === 3, JSON.stringify(removed.values));
check("present and rejecting: none", present.values === null && present.reason !== null, present.reason ?? "");
check("removing it yields MORE than keeping it", (removed.values?.length ?? 0) > 0);
check("and it is not a smaller input - four members ran either way",
  present.ran.length === 4 && removed.ran.length === 3, `${present.ran.join(",")} | ${removed.ran.join(",")}`);

say("\n== 5. two rejections, one reason");
const two = await upstream.withAll(upstream.twoReject);
await upstream.wait(60);
check("both rejecting members ran", two.ran.length === 2, two.ran.join(","));
check("reasons that reached the caller: 1", two.settled === false && typeof two.reason === "string");
check("the second failure is not reported anywhere", two.ran.length - 1 === 1);

say("\n== 6. a rejection cancels nothing");
const fast = await upstream.withAll(upstream.fastRejectSlowMember);
const atRejection = [...fast.ran];
await upstream.wait(120);
check("at the moment of rejection, the slow member had not settled", atRejection.length === 1, atRejection.join(","));
check("it settled afterwards regardless", fast.ran.length === 2, fast.ran.join(","));
check("nobody was waiting for it", fast.values === null);

say("\n== 7. the discriminator exists and is not the default");
check("Promise.allSettled is present in this runtime", typeof Promise.allSettled === "function");
const per = await upstream.withAllSettled(upstream.oneRejects);
check("it returns one entry per input, always", per.results.length === 4);
check("and the outcome is attached to the item, not beside the batch",
  per.results.every((r) => r.status === "fulfilled" ? "value" in r : "reason" in r));
check("which is what makes the kept values safe to keep",
  per.results.filter((r) => r.status === "fulfilled").length === 3
    && per.results.filter((r) => r.status === "rejected").length === 1);

say("");
if (failures.length > 0) {
  say(`  ${failures.length} FAILED: ${failures.join(" | ")}`);
  process.exitCode = 1;
} else {
  say(`  ${ran} checks passed - every probe ran the real built-ins`);
}
