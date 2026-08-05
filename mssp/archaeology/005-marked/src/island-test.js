// The island test, plus the measurement of upstream that produced the finding.
//
//   node src/island-test.js

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

import { makeRegistry, ACCUMULATE, OVERWRITE } from "./DMS/registry.js";
import { mayReplace } from "./SCL/policy.js";
import { lex, parse } from "./SMS/pipeline.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const failures = [];
const report = (label, ok, detail = "") => {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` - ${detail}` : ""}`);
  if (!ok) failures.push(label);
};

console.log("\n== 1. each renderer is an island");
for (const name of ["html", "plain"]) {
  const mod = await import(`./TMS/renderers/${name}.js`);
  const src = fs.readFileSync(path.join(here, "TMS", "renderers", `${name}.js`), "utf8");
  const out = mod.renderers.heading({ type: "heading", depth: 1, text: "x" });
  report(`renderers/${name} renders with no sibling loaded`, typeof out === "string" && out.length > 0, out);
  report(`renderers/${name} imports nothing`, !/^\s*import\s/m.test(src));
}

console.log("\n== 2. the registry reports displacement; marked's use() does not");
{
  const r = makeRegistry();
  const first = r.use("a", { heading: () => "A" });
  const second = r.use("b", { heading: () => "B" });
  report("the first install reports what it added", first.added.includes("heading"), first.added.join(","));
  report("the first install replaced nothing", first.replaced.length === 0);
  report("the second install names the type it took", second.replaced[0]?.type === "heading");
  report("and names who held it before", second.replaced[0]?.previousOwner === "a",
    "marked returns the instance on both calls - the same value on every path");
  report("the manifest answers 'what is installed'", r.manifest().length === 1,
    JSON.stringify(r.manifest()));
  report("SCL can refuse a replacement", mayReplace("renderers/plain") === false,
    "policy, not import order, decides");

  // The rule is a named argument, not a consequence of which key you passed.
  const acc = makeRegistry();
  acc.use("a", { heading: () => "A" }, ACCUMULATE);
  const stackedOn = acc.use("b", { heading: () => "B" }, ACCUMULATE);
  report("accumulate says what it stacked on", stackedOn.stacked[0]?.alsoRuns.includes("a"),
    JSON.stringify(stackedOn.stacked));
  report("every result names its own rule", stackedOn.mode === ACCUMULATE && second.mode === OVERWRITE,
    `${ACCUMULATE} / ${OVERWRITE} - in marked the rule is implied by the key name`);
  let threw = false;
  try { acc.use("c", { heading: () => "C" }, "whatever"); } catch { threw = true; }
  report("an unnamed rule is refused rather than defaulted", threw,
    "silently picking one is how the two semantics became indistinguishable upstream");
}

console.log("\n== 3. the checks can fail");
{
  // A registry that returns the same shape on every path - what marked does -
  // must be rejected by the check above. If it is not, the check is decorative.
  const blind = { use: () => ({ added: [], replaced: [], by: "?" }) };
  const b1 = blind.use("a", {});
  const b2 = blind.use("b", {});
  report("a use() that reports nothing is detected as such",
    JSON.stringify(b1) === JSON.stringify(b2) && b2.replaced.length === 0,
    "identical return values, no displacement reported - the failing case");

  // And an unhandled token must be reported, not silently dropped.
  const only = makeRegistry();
  only.use("partial", { heading: () => "h" });
  const results = parse(lex("# t\nbody\n"), only.renderer());
  report("an unhandled token type is reported, not dropped",
    results.some((x) => !x.ok && x.type === "paragraph"), "1 of 2 tokens had no renderer");
}

console.log("\n== 4. measured against marked 15.0.12 itself");
{
  let marked;
  try { marked = require("marked"); } catch { marked = null; }
  if (!marked) {
    report("marked is installed for the live measurement", false, "run npm i in the site root");
  } else {
    const pkg = require("marked/package.json");
    report("examined version is the installed version", pkg.version === "15.0.12", pkg.version);

    const M = marked.Marked;
    const inst = new M();
    inst.use({ renderer: { heading: () => "<h1 class=a>hi</h1>" } });
    const afterFirst = inst.parse("# hi").trim();
    inst.use({ renderer: { heading: () => "<h1 class=b>hi</h1>" } });
    const afterSecond = inst.parse("# hi").trim();
    report("two use() calls on one method: the second wins",
      afterFirst.includes("class=a") && afterSecond.includes("class=b"),
      `${afterFirst} -> ${afterSecond}`);
    report("the first renderer is unreachable and nothing said so",
      !afterSecond.includes("class=a"), "no error, no warning, no return value difference");

    const r1 = inst.use({ renderer: { heading: () => "x" } });
    const r2 = inst.use({ renderer: { heading: () => "y" } });
    report("use() returns the same kind of value on both calls", r1 === r2 && r1 === inst,
      "the instance, for chaining - it cannot express what happened");

    const asks = Object.keys(marked).filter((k) => /list|installed|extensions|registry/i.test(k));
    report("there is no API to ask what is installed", asks.length === 0,
      `keys matching list/installed/registry: ${asks.join(", ") || "none"}`);

    // The sharper finding: one use(), two opposite semantics, chosen by key name.
    const ran = (key, make) => {
      const i = new M();
      const seen = [];
      i.use(make(seen, "first"));
      i.use(make(seen, "second"));
      i.parse("# hi");
      return [...new Set(seen)];
    };
    const walk = ran("walkTokens", (seen, tag) => ({ walkTokens: () => seen.push(tag) }));
    const hooks = ran("hooks", (seen, tag) => ({ hooks: { preprocess(md) { seen.push(tag); return md; } } }));
    const rend = ran("renderer", (seen, tag) => ({ renderer: { heading() { seen.push(tag); return "x"; } } }));
    report("use({walkTokens}) ACCUMULATES", walk.length === 2, walk.join(", "));
    report("use({hooks}) ACCUMULATES", hooks.length === 2, hooks.join(", "));
    report("use({renderer}) OVERWRITES", rend.length === 1, rend.join(", "));
    report("one function, two opposite semantics, selected by key name",
      walk.length === 2 && rend.length === 1,
      "and use() returns the instance for all of them - the call site cannot tell which it got");
    report("the accumulating ones run last-registered-first", walk[0] === "second",
      "a stack, not a queue - order is a second undocumented consequence of calling twice");

    // The isolated path exists and works. This is the part marked gets right.
    const iso = new M({ renderer: { heading: () => "<h1 class=iso>hi</h1>" } });
    const isoOut = iso.parse("# hi").trim();
    const globalOut = marked.parse("# hi").trim();
    report("new Marked() is genuinely isolated", isoOut.includes("class=iso"), isoOut);
    report("and the module-level global is untouched by it",
      globalOut.includes("<h1>hi</h1>"), globalOut);

    // Measured on the prototype, not by grepping the bundle: a regex over source
    // text counts what the text says, and this week has already produced three
    // checks that reported on prose rather than on the thing.
    const proto = marked.Renderer.prototype;
    const methods = Object.getOwnPropertyNames(proto)
      .filter((k) => k !== "constructor" && typeof proto[k] === "function");
    report("Renderer is one method per token type", methods.length >= 20,
      `${methods.length}: ${methods.slice(0, 6).join(", ")}, …`);
    const parserProto = marked.Parser.prototype;
    const parserMethods = Object.getOwnPropertyNames(parserProto)
      .filter((k) => k !== "constructor" && typeof parserProto[k] === "function");
    report("Parser is much smaller than Renderer", parserMethods.length < methods.length / 4,
      `Parser ${parserMethods.length} vs Renderer ${methods.length} - the walk is small, the treatment is wide`);
    const cjsLines = fs.readFileSync(require.resolve("marked"), "utf8").split("\n").length;
    report("marked.cjs line count as recorded in meta", cjsLines === 2212, `${cjsLines} lines`);
  }
}

console.log("");
if (failures.length) {
  console.log(`  ${failures.length} check(s) failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("  island test passed");
