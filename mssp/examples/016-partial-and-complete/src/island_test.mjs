// The island test.
//
//   node src/island_test.mjs
//
// Section 3 is the one the example exists for: two sources produce two records
// each, and only one of them finished. Section 5 is the finding — removing the
// broken source gives more than keeping it, which is the opposite of what
// example 015 measured.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as collect from "./SMS/collect.mjs";
import * as policy from "./SCL/policy.mjs";
import * as allOrNothing from "./TMS/combiners/all_or_nothing.mjs";
import * as settleEach from "./TMS/combiners/settle_each.mjs";

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

const { sources, combiners, problems } = collect.load();
const rows = collect.runAll(sources);
const row = (name) => rows.find((r) => r.source === name);

say("\n== 1. every source and combiner is an island, and FMS matches the tree");
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
    const reached = siblings.filter((s) => new RegExp(`from\\s+["'][^"']*${s}`).test(body));
    check(`${unit}/${file} reaches no sibling`, reached.length === 0, reached.join(", "));
    check(`${unit}/${file} reaches no other set`, !/from\s+["'][^"']*\/(SMS|DMS|SCL|FMS)\//.test(body));
  }
}

say("\n== 2. five outcomes, and `partial` is one of them");
check("SMS names five outcomes", collect.OUTCOMES.length === 5, collect.OUTCOMES.join(", "));
check("breaks-midway is partial", row("breaks-midway").outcome === "partial");
check("  not `worked` - it did not finish", row("breaks-midway").finished === false);
check("  not `failed` - it produced real records", row("breaks-midway").records.length === 2);
check("full-batch worked", row("full-batch").outcome === "worked" && row("full-batch").finished === true);
const absentRow = collect.run(sources["breaks-midway"], { absent: true });
check("removed, it is absent and nothing ran", absentRow.outcome === "absent" && absentRow.records.length === 0);

say("\n== 3. the control - the same number for the opposite reason");
const short = row("short-batch");
const broke = row("breaks-midway");
check("short-batch yielded two records", short.records.length === 2);
check("and it DID finish - the control", short.finished === true);
check("breaks-midway yielded two records as well", broke.records.length === 2);
check("and it did NOT finish", broke.finished === false);
check("so a count cannot separate them, and the outcome can - 2 == 2, worked != partial",
  short.records.length === broke.records.length && short.outcome !== broke.outcome);

say("\n== 4. the outcome has to travel WITH the records");
const pile = [...short.records, ...broke.records];
check("in one array the four records are indistinguishable by shape",
  new Set(pile.map((r) => Object.keys(r).sort().join(","))).size === 1);
check("every record names the unit that produced it", pile.every((r) => typeof r.from === "string"));
check("so the pile can still be asked how many came from an unfinished source",
  collect.fromUnfinished(rows, pile) === 2, `${collect.fromUnfinished(rows, pile)} of ${pile.length}`);
const unlabelled = {
  NAME: "drill-unlabelled", CAN_FAIL_WITH: ["x"],
  *records() { yield { id: "u-1" }; },
};
const drill4 = collect.run(unlabelled);
check("DRILL: a record with no origin is refused, not counted",
  drill4.outcome === "failed" && /without a usable "from"/.test(drill4.error ?? ""), drill4.error ?? "");

say("\n== 5. removing it gives more than keeping it");
const removed = allOrNothing.combine(collect.runAll(sources, { absent: ["breaks-midway"] }));
const kept = allOrNothing.combine(rows);
const settled = settleEach.combine(rows);
check("removed (island test): 5 records", removed.records.length === 5);
check("present and failing: 0 records", kept.records.length === 0);
check("and 7 already in hand were discarded", kept.discarded === 7);
check("removing the broken source yields MORE than keeping it",
  removed.records.length > kept.records.length, `${removed.records.length} > ${kept.records.length}`);
check("settle-each keeps all 7, 2 of them from a source that did not finish",
  settled.records.length === 7 && collect.fromUnfinished(rows, settled.records) === 2);
check("the two combiners disagree by 7 records on the same runs",
  settled.records.length - kept.records.length === 7);

say("\n== 6. a unit that does not declare itself is refused");
const mute = { COMBINER: "drill-mute", combine: (runs) => ({ records: [], discarded: 0, refused: null }) };
check("DRILL: a combiner with no KEEPS_PARTIAL_WORK is refused",
  collect.load([], [mute]).problems.some((p) => /drill-mute: KEEPS_PARTIAL_WORK/.test(p)));
const silent = { NAME: "drill-silent", CAN_FAIL_WITH: [], *records() {} };
check("DRILL: a source with an empty CAN_FAIL_WITH is refused (改良點 13)",
  collect.load([silent]).problems.some((p) => /drill-silent: CAN_FAIL_WITH is empty/.test(p)));
check("and the honest units raise nothing", collect.load().problems.length === 0);
check("an unknown combiner fails closed",
  collect.resolveCombiner("no-such-combiner", combiners)[1]?.startsWith("combiner \"no-such-combiner\""));
check("SCL's combiner does resolve", collect.resolveCombiner(policy.combinerName(), combiners)[0] !== null);

say("\n== 7. what this cannot see, asserted so it stays measured");
const swallows = {
  NAME: "drill-swallows", CAN_FAIL_WITH: ["connection-reset"],
  *records() {
    yield { from: "drill-swallows", id: "w-1" };
    yield { from: "drill-swallows", id: "w-2" };
    try { throw new Error("connection-reset"); } catch { return; }
  },
};
const swallowed = collect.run(swallows);
check("a source that catches its own failure reports as `worked`", swallowed.outcome === "worked");
check("and is indistinguishable from short-batch by every field this collector reads",
  swallowed.outcome === short.outcome && swallowed.finished === short.finished
    && swallowed.records.length === short.records.length,
  "the limit named in FMS non_goals - if this ever goes red, the limit changed and the text must too");

say("");
if (failures.length > 0) {
  say(`  ${failures.length} FAILED: ${failures.join(" | ")}`);
  process.exitCode = 1;
} else {
  say(`  ${ran} checks passed - ${rows.length} sources, ${Object.keys(combiners).length} combiners`);
}
