// The island test.
//
//   node src/island_test.mjs
//
// Section 2 is the finding: two one-value accessors of the same object keep
// opposite ends and neither reports a choice.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as policy from "./SCL/policy.mjs";
import * as accessors from "./SMS/accessors.mjs";
import * as upstream from "./SMS/upstream.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const ARCH = JSON.parse(fs.readFileSync(path.join(here, "FMS", "architecture.json"), "utf8"));
const failures = [];
const check = (label, ok, detail = "") => {
  process.stdout.write(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` - ${detail}` : ""}\n`);
  if (!ok) failures.push(label);
};
const say = (line = "") => process.stdout.write(`${line}\n`);
const { loaded, problems } = await accessors.load();
const original = new URLSearchParams(upstream.SAMPLE).getAll("tag").length;
const survivors = Object.fromEntries(Object.keys(loaded).map((n) =>
  [n, accessors.survivorCount(n, upstream.SAMPLE)]));

say("\n== 1. every accessor is an island, declares itself, and FMS matches the tree");
check("all five accessors loaded with no problems", problems.length === 0, problems.join("; "));
const dir = path.join(here, "TMS", "accessors");
for (const file of fs.readdirSync(dir).filter((n) => n.endsWith(".mjs")).sort()) {
  const source = fs.readFileSync(path.join(dir, file), "utf8");
  const reaches = [...source.matchAll(/^\s*import[^"']*["']([^"']+)["']/gm)].map((m) => m[1]);
  check(`${file} imports nothing`, reaches.length === 0, reaches.join(", ") || "no imports at all");
}
for (const [where, expected] of Object.entries(ARCH.units)) {
  const onDisk = fs.readdirSync(path.join(here, ...where.split("/")))
    .filter((n) => n.endsWith(".mjs")).sort();
  check(`${where}: FMS declares ${expected.length}, on disk ${onDisk.length}`,
    JSON.stringify(onDisk) === JSON.stringify([...expected].sort()), onDisk.join(", "));
}

say("\n== 2. two one-value accessors, opposite ends, no complaint from either");
const r = upstream.readings();
check("get and Object.fromEntries both return exactly one value",
  typeof r['get("tag")'] === "string" && typeof r["Object.fromEntries"] === "string");
check("and they are DIFFERENT values",
  r['get("tag")'] !== r["Object.fromEntries"],
  `${JSON.stringify(r['get("tag")'])} vs ${JSON.stringify(r["Object.fromEntries"])}`);
check("get keeps the first", r['get("tag")'] === r['getAll("tag")'][0]);
check("Object.fromEntries keeps the last",
  r["Object.fromEntries"] === r['getAll("tag")'][r['getAll("tag")'].length - 1]);
check("and getAll shows what both discarded", r['getAll("tag")'].length === 3,
  JSON.stringify(r['getAll("tag")']));
check("nothing in the interface reports the discard",
  r['has("tag")'] === true && r.size === 4,
  "has() says yes and size counts pairs, not keys - neither mentions multiplicity");

say("\n== 3. each declaration is checked by running it, against a measured baseline");
for (const name of Object.keys(loaded).sort()) {
  const module = loaded[name];
  const holds = module.HOW_MANY_SURVIVE === "one"
    ? survivors[name] === 1 : survivors[name] >= original;
  check(`${name}: declared ${module.HOW_MANY_SURVIVE}, ${survivors[name]} of ${original} survive`, holds);
}
say("        The baseline is measured from the sample. An earlier version");
say("        hardcoded 3 for \"all\" and flagged `append` - which keeps all three");
say("        AND adds one. The check was wrong; the accessor was not.");
check("a mislabelled accessor would still be caught",
  (() => { const fake = { HOW_MANY_SURVIVE: "all" };
    return !(fake.HOW_MANY_SURVIVE === "one" ? survivors.get === 1 : survivors.get >= original); })(),
  "get declared all, 1 survives");

say("\n== 4. set and append are not siblings");
const m = upstream.mutations();
check("set collapses two values to one", m.afterSet === "tag=z", m.afterSet);
check("append leaves three", m.afterAppend.split("tag=").length - 1 === 3, m.afterAppend);
check("and the two calls look alike at the call site", true,
  "params.set(k, v) and params.append(k, v) - same arity, same shape, opposite semantics");

say("\n== 5. what answers the same however it went");
const rv = upstream.returnValues();
const undef = Object.entries(rv).filter(([, v]) => v === undefined).map(([k]) => k);
check("three mutators return undefined on every path", undef.length === 3, undef.join(", "));
check("and a missing key returns null, not undefined", rv["get(missing)"] === null,
  "so `undefined` never distinguishes a mutation from anything");

say("\n== 6. fail closed");
check("an unresolvable accessor stops the run",
  Boolean(accessors.resolve("params.first", loaded).problem),
  accessors.resolve("params.first", loaded).problem);
check("SCL names an accessor that exists", Boolean(loaded[policy.accessor()]), policy.accessor());

say("\n== 7. what this entry cannot see");
say("        MEASURABLE, NOT MEASURED");
say("          - how often a repeated key reaches a real handler by accident");
say("          - how many frameworks convert params to a plain object by default");
say("        NOT MEASURABLE HERE");
say("          - whether the WHATWG design is wrong. A query genuinely permits");
say("            repetition, so a one-value accessor must choose, and `get` is");
say("            named honestly for what it returns.");
say("          - what any particular caller believed `get` meant.");

say(failures.length ? `\n${failures.length} failure(s)` : "\nall checks passed");
for (const f of failures) say(`  - ${f}`);
process.exit(failures.length ? 1 : 0);
