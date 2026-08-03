// The island test, and four attempts to make the ledger lie.
//
//   node src/island-test.js
//
// Sections 1–2 are the ordinary island test: each transform alone, no sibling
// loaded. Sections 3–5 exist because of 改良點 6 — a check nobody has watched
// fail is not yet a check, and every claim this example makes rests on the
// ledger being able to say no.

import { assessment, render } from "./DMS/ledger.js";
import { assertMayDrop, PermissionError } from "./SCL/policy.js";
import { DROPPED, outcome, record, UNCHANGED } from "./SMS/model.js";
import { migrate } from "./SMS/pipeline.js";
import { reconcile } from "./SMS/reconcile.js";
import { normalisePhone } from "./TMS/transforms/normalise-phone.js";
import { splitName } from "./TMS/transforms/split-name.js";

const failures = [];
const report = (label, ok, detail = "") => {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` - ${detail}` : ""}`);
  if (!ok) failures.push(label);
};

const PEOPLE = [
  record("p-1", { name: "Ada Lovelace", phone: "0912-345-678" }),
  record("p-2", { name: "Prince", phone: "+886912345678" }),
];

console.log("\n== 1. transforms/split-name alone");
{
  const result = migrate(PEOPLE, [splitName]);
  report("runs with no sibling loaded", result.reconciliation.balanced,
    `${result.reconciliation.accounted} of ${result.reconciliation.input} accounted for`);
  report("split-name was actually invoked", result.invocations["transforms/split-name"] === 2,
    `invoked ${result.invocations["transforms/split-name"]}`);
  report("phone fields survived untouched", PEOPLE.every((p) => p.fields.phone !== undefined),
    "the absent transform left its fields alone rather than nulling them");
}

console.log("\n== 2. transforms/normalise-phone alone");
{
  const result = migrate(PEOPLE, [normalisePhone]);
  const applied = result.outcomes.filter((o) => o.kind === "applied");
  report("runs with no sibling loaded", result.reconciliation.balanced);
  report("normalise-phone was actually invoked", result.invocations["transforms/normalise-phone"] === 2);
  report("it changed the one that needed changing", applied.length === 1,
    `${applied.length} applied; the already-normalised number came back unchanged`);
  report("assessment reports nothing unexercised here", assessment(result).unexercised.length === 0);
}

console.log("\n== 3. reconciliation rejects a lost record");
{
  // The failure this exists for: a loop that returns early, or a filter applied
  // before counting. Four records in, three outcomes out, zero failures.
  const outcomes = PEOPLE.map((p) => outcome(UNCHANGED, { by: "x", id: p.id, before: p }));
  const bad = reconcile(3, outcomes.slice(0, 2));
  const worse = reconcile(4, outcomes.slice(0, 2));
  report("a shortfall is unbalanced", !worse.balanced, `missing ${worse.missing}`);
  report("and the shortfall is reported, not just flagged", worse.missing === 2);
  report("an exact match still balances", reconcile(2, outcomes).balanced);
  void bad;
}

console.log("\n== 4. reconciliation rejects a duplicated record");
{
  const one = record("d-1", { name: "A B" });
  const twice = [
    outcome(UNCHANGED, { by: "x", id: "d-1", before: one }),
    outcome(UNCHANGED, { by: "y", id: "d-1", before: one }),
  ];
  const r = reconcile(2, twice);
  // The totals agree — 2 in, 2 accounted — and it is still wrong.
  report("counts alone would have passed", r.accounted === r.input);
  report("the duplicate is caught anyway", !r.balanced, `duplicated [${r.duplicated.join(", ")}]`);
}

console.log("\n== 5. the ledger cannot hide an unexercised capability");
{
  const noPhones = [record("n-1", { name: "Ada Lovelace" })];
  const result = migrate(noPhones, [splitName, normalisePhone]);
  const text = render(result);
  report("the report names it", text.includes("NEVER INVOKED"));
  report("and says what it would have needed", text.includes("reads phone"));
  report("assessment agrees", assessment(result).unexercised.includes("transforms/normalise-phone"));

  // and the inverse: given phones, the same code must stop saying it
  const withPhones = [record("n-2", { name: "Ada Lovelace", phone: "0912345678" })];
  const covered = render(migrate(withPhones, [splitName, normalisePhone]));
  report("and stops saying it when the capability does run", !covered.includes("NEVER INVOKED"),
    "otherwise the warning is decoration that is always present");
}

console.log("\n== 6. SCL refuses a drop from a transform that may not drop");
{
  const rogue = {
    name: "transforms/split-name",           // policy says may_drop: false
    applies: () => true,
    apply: (r) => outcome(DROPPED, { by: "transforms/split-name", id: r.id, before: r, reason: "because I felt like it" }),
  };
  const result = migrate([record("s-1", { name: "A B" })], [rogue]);
  const kinds = result.outcomes.map((o) => o.kind);
  report("the drop did not take effect", !kinds.includes(DROPPED), `outcomes: ${kinds.join(", ")}`);
  report("it was recorded as a failure, not silently ignored", kinds.includes("failed"));
  report("the record is still accounted for", result.reconciliation.balanced);

  let threw = false;
  try { assertMayDrop("transforms/split-name"); } catch (e) { threw = e instanceof PermissionError; }
  report("assertMayDrop itself throws", threw);
}

console.log("");
if (failures.length) {
  console.log(`  ${failures.length} check(s) failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("  island test passed");
