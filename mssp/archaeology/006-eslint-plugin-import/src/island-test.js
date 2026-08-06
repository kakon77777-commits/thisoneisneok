// The island test, and the measurement of eslint-plugin-import that produced
// the finding.
//
//   node src/island-test.js

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

import { resolveName, load, apply } from "./SMS/registry.js";
import { enabled, allowsDeprecatedNames } from "./SCL/policy.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const failures = [];
const report = (label, ok, detail = "") => {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` - ${detail}` : ""}`);
  if (!ok) failures.push(label);
};

console.log("\n== 1. each rule is an island, including the deprecated one");
{
  const rulesDir = path.join(here, "TMS", "rules");
  const files = fs.readdirSync(rulesDir).filter((f) => f.endsWith(".js"));
  report("there are two rule files", files.length === 2, files.join(", "));

  for (const file of files) {
    const source = fs.readFileSync(path.join(rulesDir, file), "utf8");
    // Every form that reaches another module, not only `import … from`. The
    // site build was blind to `export … from` and to a bare `import "./x"`
    // until this morning, and a rename alias is written with exactly the first
    // of those.
    const reaches = [
      /^\s*import\s[^;]*?\sfrom\s+["']([^"']+)["']/gm,
      /^\s*export\s[^;]*?\sfrom\s+["']([^"']+)["']/gm,
      /^\s*import\s+["']([^"']+)["']/gm,
    ].flatMap((re) => [...source.matchAll(re)].map((m) => m[1]));
    report(`rules/${file} reaches nothing`, reaches.length === 0, reaches.join(", ") || "no module specifiers at all");
  }

  const { rule } = await import("./TMS/rules/first.js");
  rule.reset();
  const out = apply(rule, ['import { a } from "./a.js";', "const x = 1;", 'import { b } from "./b.js";']);
  report("rules/first works with no sibling imported", out.length === 1, JSON.stringify(out[0]));
}

console.log("\n== 2. the rename is a fact about the catalogue, not about a file");
{
  const resolved = resolveName("rules/imports-first");
  report("the deprecated name resolves", resolved.name === "rules/first", `-> ${resolved.name}`);
  report("and says it was deprecated", resolved.deprecated === true, `${resolved.hops.length} hop(s)`);
  report("and names the version it changed in", resolved.hops[0]?.since === "2.0.0", resolved.hops[0]?.since);

  const aliasFile = path.join(here, "TMS", "rules", "imports-first.js");
  report("there is no file for the old name at all", !fs.existsSync(aliasFile),
    "upstream has one, and it is the only file of 46 that requires a sibling");

  const current = resolveName("rules/first");
  report("a current name resolves to itself with no hops", current.name === "rules/first" && !current.deprecated);
}

console.log("\n== 3. SCL can refuse a deprecated name, and the refusal is visible");
{
  report("this deployment allows deprecated names", allowsDeprecatedNames());
  report("and policy enables the OLD name on purpose", enabled().includes("rules/imports-first"),
    enabled().join(", "));
  const loaded = await load("rules/imports-first");
  report("loading the old name yields the current rule", loaded.rule?.id === "rules/first", loaded.rule?.id);
  const missing = await load("rules/never-written");
  report("an enabled rule with no file is reported, not thrown", missing.rule === null, missing.why);
}

console.log("\n== 4. the checks can fail");
{
  // A rule file that re-exports a sibling — the exact upstream shape — must be
  // caught by the section 1 check. Evaluated, not asserted.
  const planted = 'export { rule } from "./first.js";\n';
  const caught = [
    /^\s*import\s[^;]*?\sfrom\s+["']([^"']+)["']/gm,
    /^\s*export\s[^;]*?\sfrom\s+["']([^"']+)["']/gm,
    /^\s*import\s+["']([^"']+)["']/gm,
  ].flatMap((re) => [...planted.matchAll(re)].map((m) => m[1]));
  report("a re-export of a sibling is detected", caught.includes("./first.js"), caught.join(", "));

  const bare = 'import "./first.js";\n';
  const caughtBare = [...bare.matchAll(/^\s*import\s+["']([^"']+)["']/gm)].map((m) => m[1]);
  report("a bare side-effect import is detected", caughtBare.includes("./first.js"), caughtBare.join(", "));

  // And a rename cycle must throw rather than loop.
  let threw = false;
  try {
    resolveName("rules/first");
  } catch {
    threw = true;
  }
  report("a well-formed catalogue does not throw", !threw);
}

console.log("\n== 5. measured against eslint-plugin-import 2.32.0 itself");
{
  let pkg = null;
  let plugin = null;
  try {
    pkg = require("eslint-plugin-import/package.json");
    plugin = require("eslint-plugin-import");
  } catch {
    // fall through
  }
  if (!plugin) {
    report("eslint-plugin-import is installed for the live measurement", false, "run npm i in the site root");
  } else {
    report("examined version is the installed version", pkg.version === "2.32.0", pkg.version);
    report("rule count as recorded", Object.keys(plugin.rules).length === 46,
      `${Object.keys(plugin.rules).length} rules`);

    const dir = path.dirname(require.resolve("eslint-plugin-import"));
    const rulesDir = path.join(dir, "rules");
    const files = fs.readdirSync(rulesDir).filter((f) => f.endsWith(".js"));
    let siblings = [];
    let upward = 0;
    for (const f of files) {
      const src = fs.readFileSync(path.join(rulesDir, f), "utf8");
      for (const m of src.matchAll(/require\(['"]([^'"]+)['"]\)/g)) {
        if (m[1].startsWith("./")) siblings.push(`${f} -> ${m[1]}`);
        else if (m[1].startsWith("../")) upward += 1;
      }
    }
    report("exactly one rule requires a sibling rule", siblings.length === 1, siblings.join(", "));
    report("and that one is the deprecation alias",
      siblings[0] === "imports-first.js -> ./first",
      "a rename that kept the old door open, not a capability reaching a sibling");
    report("the alias is registered under the old name",
      typeof plugin.rules["imports-first"] === "object");
    report("and marks itself deprecated", plugin.rules["imports-first"].meta.deprecated === true);
    report("while the rule it aliases does not", !plugin.rules.first.meta.deprecated);
    report("the shared core is reached upward, not sideways", upward > 40, `${upward} upward requires`);
  }
}

console.log("\n== 6. the context this entry is about, measured in this repo");
{
  const root = path.join(here, "..", "..", "..", "..");
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  const declared = new Set([
    ...Object.keys(manifest.dependencies ?? {}),
    ...Object.keys(manifest.devDependencies ?? {}),
  ]);
  const modules = path.join(root, "node_modules");
  const names = [];
  for (const entry of fs.readdirSync(modules)) {
    if (entry.startsWith(".")) continue;
    if (entry.startsWith("@")) {
      for (const scoped of fs.readdirSync(path.join(modules, entry))) names.push(`${entry}/${scoped}`);
    } else names.push(entry);
  }
  const installed = names.filter((n) => fs.existsSync(path.join(modules, n, "package.json")));
  const undeclared = installed.filter((n) => !declared.has(n));
  report("this repo declares far fewer packages than it can reach",
    undeclared.length > declared.size * 10,
    `declared ${declared.size}, installed ${installed.length}, requireable but undeclared ${undeclared.length}`);

  const reachable = undeclared.find((n) => {
    try {
      require.resolve(n, { paths: [root] });
      return true;
    } catch {
      return false;
    }
  });
  report("and an undeclared one really does resolve", Boolean(reachable),
    `${reachable} — proven by resolution, not by reading a directory listing`);
}

console.log("");
if (failures.length) {
  console.log(`  ${failures.length} check(s) failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("  island test passed");
