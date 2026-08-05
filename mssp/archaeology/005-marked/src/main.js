// Two renderers competing for the same token types.
//
//   node src/main.js

import { makeRegistry, ACCUMULATE, OVERWRITE } from "./DMS/registry.js";
import { mayReplace } from "./SCL/policy.js";
import { lex, parse } from "./SMS/pipeline.js";
import { renderers as html, name as htmlName } from "./TMS/renderers/html.js";
import { renderers as plain, name as plainName } from "./TMS/renderers/plain.js";

const DOC = "# Title\nsome text\n> a quote\n";

function main() {
  const registry = makeRegistry();

  console.log("\n== marked re-cut");

  const first = registry.use(plainName, plain, OVERWRITE);
  console.log(`\n  ${first.by}  [${first.mode}]`);
  console.log(`    added    ${first.added.join(", ")}`);
  console.log(`    replaced ${first.replaced.length ? first.replaced.map((r) => r.type).join(", ") : "nothing"}`);

  const second = registry.use(htmlName, html, OVERWRITE);
  console.log(`\n  ${second.by}  [${second.mode}]`);
  console.log(`    added    ${second.added.join(", ") || "nothing"}`);
  for (const r of second.replaced) {
    const allowed = mayReplace(second.by);
    console.log(`    replaced ${r.type} (previously ${r.previousOwner})${allowed ? "" : "  - SCL: not permitted"}`);
  }

  // The same call under the other rule. In marked this distinction is not a
  // parameter: use({renderer}) overwrites and use({walkTokens}) accumulates,
  // and the only way to find out which you got is to read marked's source.
  const third = registry.use("renderers/audit", { heading: (t) => `[audit] ${t.text}` }, ACCUMULATE);
  console.log(`\n  ${third.by}  [${third.mode}]`);
  for (const s of third.stacked) {
    console.log(`    stacked  ${s.type} (also installed: ${s.alsoRuns.join(", ")})`);
  }

  console.log("\n  what is installed, and by whom");
  for (const entry of registry.manifest()) {
    const also = entry.alsoRuns.length ? `  (also: ${entry.alsoRuns.join(", ")})` : "";
    console.log(`    ${entry.type.padEnd(12)} ${entry.by}${also}`);
  }

  console.log("\n  rendering");
  const results = parse(lex(DOC), registry.renderer());
  for (const r of results) {
    console.log(`    ${r.ok ? "  " : "??"} ${r.ok ? r.out : `no renderer for ${r.type}`}`);
  }

  // The assertion: the second install reported a replacement. In marked it
  // returns the instance, identically, and the displaced renderer is gone.
  if (second.replaced.length === 0) {
    console.log("\n  RE-CUT FAILED: the second install replaced nothing, so nothing is demonstrated");
    return 1;
  }
  console.log(`\n  the second install reported ${second.replaced.length} displacement(s) rather than returning the same value as the first.`);
  return 0;
}

process.exit(main());
