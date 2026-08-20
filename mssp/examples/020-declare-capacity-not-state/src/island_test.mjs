// The island test.
//
//   node src/island_test.mjs
//
// Section 2 is the one that matters most: the challenge needs both arms,
// because a reader that answers the same way every time is right about one of
// them. Section 3 is the control pair — two silences that must not share a
// column.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as harness from "./SMS/challenge.mjs";
import * as policy from "./SCL/policy.mjs";
import * as claimsFraming from "./TMS/readers/claims_framing.mjs";
import * as framed from "./TMS/readers/framed.mjs";
import * as opaquePipe from "./TMS/readers/opaque_pipe.mjs";

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

const { readers, problems } = harness.load();
const results = Object.fromEntries(
  Object.keys(readers).map((name) => [name, harness.challenge(readers[name])]));

say("\n== 1. every reader is an island, and FMS matches the tree");
check("loading raised no problems", problems.length === 0, problems.join("; "));
for (const [unit, declared] of Object.entries(CONTRACT.units)) {
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
check("every reader states a capacity either way",
  [framed, opaquePipe, claimsFraming].every((m) => typeof m.CLAIMS_CAN_DISCRIMINATE === "boolean"));
check("and says HOW, so the claim is inspectable as well as testable",
  [framed, opaquePipe, claimsFraming].every((m) => Boolean(m.HOW)));

say("\n== 2. the challenge needs both arms - a constant answer must not pass");
const alwaysTruncated = {
  NAME: "drill-always-truncated", CAN_FAIL_WITH: ["x"],
  CLAIMS_CAN_DISCRIMINATE: true, HOW: "it answers the same way every time",
  read: (stream) => ({ records: [{ from: "drill-always-truncated", id: "d-1" }],
    incomplete_because: "no terminator record" }),
};
const alwaysComplete = {
  NAME: "drill-always-complete", CAN_FAIL_WITH: ["x"],
  CLAIMS_CAN_DISCRIMINATE: true, HOW: "it answers the same way every time",
  read: (stream) => ({ records: [{ from: "drill-always-complete", id: "d-1" }],
    incomplete_because: null }),
};
const cheatTruncated = harness.challenge(alwaysTruncated);
const cheatComplete = harness.challenge(alwaysComplete);
check("a reader that always says truncated IS right about the truncated stream",
  cheatTruncated.rightAboutTruncated === true);
check("and wrong about the complete one", cheatTruncated.rightAboutComplete === false);
check("so a one-armed challenge would have passed it", cheatTruncated.constant === true);
check("and the two-armed one does not", cheatTruncated.passed === false);
check("the mirror image fails too", cheatComplete.passed === false
  && cheatComplete.rightAboutComplete === true && cheatComplete.rightAboutTruncated === false);
check("the harness knows both answers because it built both streams",
  harness.COMPLETE_STREAM.endsWith("<end>") && !harness.TRUNCATED_STREAM.endsWith("<end>"));
check("and the two streams differ only by the terminator",
  harness.COMPLETE_STREAM.replace("|<end>", "") === harness.TRUNCATED_STREAM);

say("\n== 3. the control pair - two silences that must not share a column");
const truncated = harness.readAll(readers, harness.TRUNCATED_STREAM);
const row = (name) => truncated.find((r) => r.reader === name);
const onComplete = harness.readAll(readers, harness.COMPLETE_STREAM);
check("on the truncated stream, framed speaks", row("framed").incomplete_because !== null);
check("and opaque-pipe does not", row("opaque-pipe").incomplete_because === null);
check("they return the same number of records",
  row("framed").records.length === row("opaque-pipe").records.length,
  `${row("framed").records.length}`);
const framedOnComplete = onComplete.find((r) => r.reader === "framed");
check("on the COMPLETE stream, framed is silent too - the control",
  framedOnComplete.incomplete_because === null);
check("so silence alone does not separate them",
  framedOnComplete.incomplete_because === row("opaque-pipe").incomplete_because);
check("and the completeness column does",
  framedOnComplete.completeness !== row("opaque-pipe").completeness,
  `${framedOnComplete.completeness} | ${row("opaque-pipe").completeness}`);
check("there are three values, and none of them is `complete`",
  new Set([harness.DECLARED_INCOMPLETE, harness.SILENT_AND_CAN_TELL, harness.SILENT_AND_CANNOT]).size === 3
  && ![harness.DECLARED_INCOMPLETE, harness.SILENT_AND_CAN_TELL, harness.SILENT_AND_CANNOT]
    .includes("complete"));

say("\n== 4. the liar is caught by running it, not by reading it");
check("claims-framing declares it can discriminate",
  claimsFraming.CLAIMS_CAN_DISCRIMINATE === true);
check("its source is identical in behaviour to the opaque pipe",
  claimsFraming.read(harness.TRUNCATED_STREAM).incomplete_because
  === opaquePipe.read(harness.TRUNCATED_STREAM).incomplete_because);
check("the challenge refuses it", results["claims-framing"].passed === false
  && harness.accepted(results["claims-framing"]) === false);
check("framed's identical claim is accepted", results.framed.passed === true
  && harness.accepted(results.framed) === true);
check("and opaque-pipe, which claimed nothing, is not refused for failing",
  harness.accepted(results["opaque-pipe"]) === true
  && results["opaque-pipe"].passed === false);
check("so refusal keys on the CLAIM, not on the outcome",
  results["claims-framing"].passed === results["opaque-pipe"].passed
  && harness.accepted(results["claims-framing"]) !== harness.accepted(results["opaque-pipe"]));

say("\n== 5. the floor now names what example 017's could not");
const kept = truncated.filter((entry) => harness.accepted(entry.challenge));
const numbers = harness.floor(kept);
check("the refused reader contributes nothing", kept.length === 2);
check("the floor counts what was declared", numbers.declared === 3, `${numbers.declared}`);
check("and separately counts what came from a blind reader", numbers.blind === 3, `${numbers.blind}`);
check("the two are different populations", numbers.declared + numbers.blind === numbers.total);
check("neither number is offered as a total of anything complete",
  !JSON.stringify(numbers).includes("complete"));

say("\n== 6. a capacity claim is not a state claim");
const vouching = {
  NAME: "drill-vouch", CAN_FAIL_WITH: ["x"], CLAIMS_CAN_DISCRIMINATE: true,
  HOW: "x", COMPLETE: true, read: () => ({ records: [], incomplete_because: null }),
};
check("DRILL: a reader declaring COMPLETE is still refused (改良點 15)",
  harness.load([vouching]).problems.some((p) => /declares COMPLETE/.test(p)));
const mute = {
  NAME: "drill-mute", CAN_FAIL_WITH: ["x"], HOW: "x",
  read: () => ({ records: [], incomplete_because: null }),
};
check("DRILL: a reader that claims no capacity either way is refused",
  harness.load([mute]).problems.some((p) => /does not claim a discrimination capacity/.test(p)));
check("but claiming FALSE is perfectly acceptable",
  harness.load().problems.length === 0 && opaquePipe.CLAIMS_CAN_DISCRIMINATE === false);
check("and no reader anywhere asserts it is complete",
  [framed, opaquePipe, claimsFraming].every((m) => m.COMPLETE === undefined));

say("\n== 7. what the challenge cannot do, asserted so it stays measured");
check("it only works where the harness can build a case it knows the answer to",
  policy.POLICY.what_this_cannot_reach.includes("challenge inputs the harness cannot construct"));
check("a reader that passes on THESE two streams has not been shown to pass on others",
  harness.COMPLETE_STREAM.split("|").length === 4,
  "one pair, one shape - the claim is demonstrated, not proved");
check("and a reader that disclaims capacity is trusted about its own blindness",
  results["opaque-pipe"].claimed === false && harness.accepted(results["opaque-pipe"]),
  "that direction is unchecked, and it is the conservative one - the same trade as 改良點 15");
check("the report never renders a blind reader's silence as informative",
  row("opaque-pipe").completeness === harness.SILENT_AND_CANNOT);

say("");
if (failures.length > 0) {
  say(`  ${failures.length} FAILED: ${failures.join(" | ")}`);
  process.exitCode = 1;
} else {
  say(`  ${ran} checks passed - ${Object.keys(readers).length} readers, 3 completeness values`);
}
