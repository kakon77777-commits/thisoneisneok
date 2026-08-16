// Two built-in combinators over the same four promises, one of which rejects.
//
//   node src/main.mjs            what each one keeps, and what ran anyway
//   node src/main.mjs --strict   exit 1 if this deployment discarded completed work
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as report from "./DMS/report.mjs";
import * as upstream from "./SMS/upstream.mjs";
import * as all from "./TMS/combinators/all.mjs";
import * as allSettled from "./TMS/combinators/all_settled.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const POLICY = JSON.parse(fs.readFileSync(path.join(here, "SCL", "policy.json"), "utf8"));
const say = (line = "") => process.stdout.write(`${line}\n`);

const UNITS = Object.fromEntries([all, allSettled].map((m) => [m.COMBINATOR, m]));

async function through(unit, build) {
  const ran = [];
  const result = await unit.combine(build(ran));
  await upstream.wait(80); // let every member settle, including the ones nobody waited for
  return { name: unit.COMBINATOR, kept: result.kept.length, ran: ran.join(","), reasons: result.reasons.length };
}

async function main(argv) {
  say(`\n  ${upstream.runtime()}`);
  say(`  ${POLICY.deployment}: combine with ${POLICY.combinator}\n`);

  say("  one member of four rejects:");
  const rows = [await through(all, upstream.oneRejects), await through(allSettled, upstream.oneRejects)];
  say(report.comparison(rows));
  say("\n  Four members ran under both. One keeps three values, the other keeps none.\n");

  say("  the control - the same four members, none rejecting:");
  const clean = [await through(all, upstream.noneReject), await through(allSettled, upstream.noneReject)];
  say(report.comparison(clean));
  say("\n  Identical. The difference is a statement about failure, not about the two functions.\n");

  const removed = await upstream.withAll(upstream.rejectingMemberRemoved);
  const present = await upstream.withAll(upstream.oneRejects);
  say(report.removalTable(
    `${removed.values?.length ?? 0}   ${JSON.stringify(removed.values ?? [])}`,
    `${present.values?.length ?? 0}   rejected: ${present.reason}`));
  say("\n  Removing the broken member gives MORE than keeping it.\n");

  const two = await upstream.withAll(upstream.twoReject);
  await upstream.wait(60);
  say(`  two members reject, reasons that reach the caller: 1 - ${two.reason}`);

  const fast = await upstream.withAll(upstream.fastRejectSlowMember);
  say(`  after the rejection, members settled so far: ${fast.ran.join(",")}`);
  await upstream.wait(100);
  say(`  ...and 100ms later:                          ${fast.ran.join(",")} - nothing was cancelled\n`);

  const details = await upstream.withAllSettled(upstream.oneRejects);
  say("  what allSettled hands back instead:");
  say(report.settled(details.results));
  say(`    ${details.results.length} entries for ${details.results.length} inputs, always\n`);

  const unit = UNITS[POLICY.combinator];
  const discarded = !unit.KEEPS_WHAT_SUCCEEDED;
  if (argv.includes("--strict") && discarded && POLICY.discarding_completed_work_is === "fatal") {
    say(`  --strict: ${POLICY.combinator} discarded work this deployment paid for, and that is fatal here`);
    return 1;
  }
  return 0;
}

process.exitCode = await main(process.argv.slice(2));
