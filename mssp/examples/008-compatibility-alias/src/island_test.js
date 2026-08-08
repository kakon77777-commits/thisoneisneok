// The island test, and the counter-example mssp-d-001 asked for.
//
//   node src/island_test.js
//
// Section 4 is the one Metron named: a declared alias whose behaviour has
// drifted must make the contract check FAIL, and it must fail because of the
// drift rather than for some other reason that happens to be true at the same
// time.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { checkAlias } from "./SMS/contract.js";
import { aliasFor, load, record, resolve } from "./SMS/registry.js";
import * as policy from "./SCL/policy.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const failures = [];
const report = (label, ok, detail = "") => {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` - ${detail}` : ""}`);
  if (!ok) failures.push(label);
};

const FIXTURE = [
  '"use strict";',
  'import { a } from "./a.js";',
  "var legacy = 1;",
  "const x = 2;",
  '"use strict";',
];

const check = (alias, oldRule, newRule) =>
  checkAlias(alias, oldRule, newRule, FIXTURE, policy.currentVersion(),
    policy.majorsBetween, policy.maxWindowVersions());

console.log("\n== 1. every authored rule is an island");
{
  const dir = path.join(here, "TMS", "rules");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".js"));
  // Four: two current rules, one legacy alias that drifted, and one unrelated
  // rule that exists so the record is not the only thing in the tree. The
  // number is written down so that adding a file without deciding what it is
  // fails here rather than passing quietly.
  report("there are four authored rules", files.length === 4, files.join(", "));
  for (const file of files) {
    const source = fs.readFileSync(path.join(dir, file), "utf8");
    const reaches = [
      /^\s*import\s[^;]*?\sfrom\s+["']([^"']+)["']/gm,
      /^\s*export\s[^;]*?\sfrom\s+["']([^"']+)["']/gm,
      /^\s*import\s+["']([^"']+)["']/gm,
    ].flatMap((re) => [...source.matchAll(re)].map((m) => m[1]));
    report(`rules/${file} reaches nothing`, reaches.length === 0, reaches.join(", ") || "no specifiers");
  }
  // The legacy shim is the interesting one: it is a compatibility alias and it
  // still does not reference the unit it aliases. It reimplements. That is why
  // the structural rule needs no exception and why the drift was possible.
  const legacy = fs.readFileSync(path.join(dir, "legacy-strict.js"), "utf8");
  report("the legacy alias reimplements rather than references",
    !legacy.includes("strict.js") && legacy.includes("use strict"),
    "no sibling reference, so module 02 is satisfied and says nothing about whether it is still equivalent");
}

console.log("\n== 2. a rename is a row in the record, not a property of a file");
{
  const alias = aliasFor("rules/imports-first");
  report("the old name resolves through FMS", resolve("rules/imports-first").name === "rules/first");
  report("and carries its own lifecycle", alias.valid_from === "2.0.0" && alias.sunset === "3.0.0",
    `${alias.valid_from}..${alias.sunset}`);
  report("a current name resolves to itself", resolve("rules/first").via === null);
  report("there is no authored file for the host-constrained old name",
    !fs.existsSync(path.join(here, "TMS", "rules", "imports-first.js")),
    "the host shim is generated into build/host-shims/, outside TMS");
  report("and the record says where it goes", alias.shim.startsWith("generated"), alias.shim);
}

console.log("\n== 3. a declaration that holds, holds for a stated reason");
{
  const alias = aliasFor("rules/imports-first");
  const base = await load(alias.replacement);
  const shim = { ...base, meta: { ...base.meta, deprecated: true } };
  const result = check(alias, shim, base);
  report("the honest alias passes", result.holds, result.problems.join("; ") || "no problems");
  report("and the only difference is one it declared in advance",
    result.deltas.length === 1 && result.deltas[0].field === "meta.deprecated" && result.deltas[0].allowed,
    JSON.stringify(result.deltas));
}

console.log("\n== 4. the counter-example: a declared alias that has drifted");
{
  const alias = aliasFor("rules/legacy-strict");
  const oldRule = await load("rules/legacy-strict");
  const newRule = await load(alias.replacement);
  const result = check(alias, oldRule, newRule);

  report("the drifted alias FAILS the contract", !result.holds, result.problems.join("; "));
  // Not "it failed". Which reason. Yesterday an island test passed on E0753
  // while claiming to prove something about E0432.
  report("and it fails BECAUSE the findings differ",
    result.problems.includes("findings differ"),
    "not merely because something else about it is also wrong");
  report("the differing finding is named", result.deltas.some((d) =>
    d.field === "findings" && d.old.some((f) => f.includes("var is not permitted"))),
    "the old name objects to var; the replacement does not");
  report("it is ALSO past sunset, and that is reported separately",
    result.problems.some((p) => p.startsWith("past sunset")),
    "two independent failures, not one failure counted twice");

  // The verifier verified: remove the drift and the findings clause must stop
  // complaining. If it still complains, the check was reporting on something
  // other than behaviour.
  const faithful = { ...newRule, meta: { ...newRule.meta, deprecated: true } };
  const repaired = check(alias, faithful, newRule);
  report("a faithful shim stops the findings complaint",
    !repaired.problems.includes("findings differ"),
    repaired.problems.join("; ") || "no problems at all");
  report("so the findings clause is what detected the drift",
    result.problems.includes("findings differ") && !repaired.problems.includes("findings differ"));
  report("while the sunset complaint survives the repair",
    repaired.problems.some((p) => p.startsWith("past sunset")),
    "lifecycle and equivalence are independent, and the report keeps them apart");
}

console.log("\n== 5. the contract cannot be satisfied by declaring the drift away");
{
  // The obvious cheat: add findings to allowed_deltas. The observer must refuse
  // it, because an equivalence contract that permits behaviour to differ is not
  // a contract.
  const alias = { ...aliasFor("rules/legacy-strict"),
    equivalence: { observer: "rule-contract-v1", allowed_deltas: ["findings", "meta.deprecated"] } };
  const oldRule = await load("rules/legacy-strict");
  const newRule = await load(alias.replacement);
  const result = check(alias, oldRule, newRule);
  report("listing findings as an allowed delta does not make the alias hold",
    !result.holds, result.problems.join("; "));
  // It now fails EARLIER than it used to. Before 2026-08-08 the refusal came out
  // of the comparison ("findings differ"); the observer now declares findings
  // non-waivable and the contract is rejected at declaration time, before
  // anything is compared. Refusing an unacceptable declaration beats refusing
  // its result, because the result depends on a fixture and the declaration
  // does not.
  report("and it is refused at declaration time, not by the comparison",
    result.problems.some((p) => p.includes("non-waivable")),
    "the observer declares findings non-waivable, so the contract never gets to run");

  // Metron ran this file on 2026-08-08 with an observer id that does not exist
  // and got holds:true — the name was a label and the comparator was hard-coded.
  const bogus = { ...aliasFor("rules/imports-first"),
    equivalence: { observer: "observer-that-does-not-exist", allowed_deltas: ["meta.deprecated"] } };
  const base = await load("rules/first");
  const bogusResult = check(bogus, { ...base, meta: { ...base.meta, deprecated: true } }, base);
  report("an observer id that does not resolve fails closed",
    !bogusResult.holds && bogusResult.problems.some((p) => p.includes("does not resolve")),
    bogusResult.problems.join("; "));

  const offObserver = { ...aliasFor("rules/imports-first"),
    equivalence: { observer: "rule-contract-v1", allowed_deltas: ["timing.ms"] } };
  const offResult = check(offObserver, { ...base, meta: { ...base.meta, deprecated: true } }, base);
  report("an allowed_delta the observer does not observe is refused",
    !offResult.holds, offResult.problems.join("; "));
}

console.log("\n== 6. SCL owns the window, not the unit");
{
  report("only a maintainer may open a compatibility window",
    policy.mayOpenAlias("maintainer") && !policy.mayOpenAlias("contributor"));
  report("the permitted window is one major version", policy.maxWindowVersions() === 1);
  const wide = { ...aliasFor("rules/imports-first"), valid_from: "1.0.0", sunset: "9.0.0" };
  const base = await load("rules/first");
  const result = check(wide, { ...base, meta: { ...base.meta, deprecated: true } }, base);
  report("a window wider than policy allows is refused",
    result.problems.some((p) => p.includes("exceeds the permitted")),
    result.problems.join("; "));
}

console.log("\n== 7. what this run does not claim");
{
  report("the record marks itself as a candidate, not adopted method",
    record.status === "candidate", record.note_on_status.slice(0, 60) + "…");
  report("and names the observer's blind spot",
    record.observers["rule-contract-v1"].what_it_cannot_see.includes("timing"),
    record.observers["rule-contract-v1"].what_it_cannot_see);
}

console.log("");
if (failures.length) {
  console.log(`  ${failures.length} check(s) failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("  island test passed");
