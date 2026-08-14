// The island test.
//
//   node src/island_test.mjs
//
// Section 2 is what the example exists for: the same request, read by two
// idiomatic readers, produces two different answers for the same field, and
// neither reader reports that it chose.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as request from "./SMS/request.mjs";
import * as policy from "./SCL/policy.mjs";
import { QUERY } from "./main.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const CONTRACT = JSON.parse(fs.readFileSync(path.join(here, "FMS", "contract.json"), "utf8"));
const failures = [];
const check = (label, ok, detail = "") => {
  process.stdout.write(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` - ${detail}` : ""}\n`);
  if (!ok) failures.push(label);
};
const say = (line = "") => process.stdout.write(`${line}\n`);
const readWith = (name) => request.readAll(QUERY, name, CONTRACT.fields);
const cell = (result, field) => result.rows.find((row) => row.field === field);

say("\n== 1. every reader is an island, declares itself, and FMS matches the tree");
const dir = path.join(here, "TMS", "readers");
const files = fs.readdirSync(dir).filter((n) => n.endsWith(".mjs")).sort();
check("there are three reader files", files.length === 3, files.join(", "));
for (const file of files) {
  const source = fs.readFileSync(path.join(dir, file), "utf8");
  const reaches = [...source.matchAll(/^\s*import[^"']*["']([^"']+)["']/gm)].map((m) => m[1]);
  check(`${file} reaches no sibling set`, reaches.length === 0,
    reaches.join(", ") || "no imports at all");
}
for (const [where, expected] of Object.entries(CONTRACT.units)) {
  const onDisk = fs.readdirSync(path.join(here, ...where.split("/")))
    .filter((n) => n.endsWith(".mjs")).sort();
  check(`${where}: FMS declares ${expected.length}, on disk ${onDisk.length}`,
    JSON.stringify(onDisk) === JSON.stringify([...expected].sort()), onDisk.join(", "));
}
for (const name of request.readerNames()) {
  const { module } = request.resolveReader(name);
  check(`${name} declares what it does on multiplicity`, Boolean(module.ON_MULTIPLICITY),
    module.ON_MULTIPLICITY);
}

say("\n== 2. two idiomatic readers, one field, two different answers");
const first = readWith("first-wins");
const last = readWith("last-wins");
check("the request carries `page` twice", cell(first, "page").received === 2);
check("first-wins and last-wins disagree about which one is the value",
  cell(first, "page").value !== cell(last, "page").value,
  `${JSON.stringify(cell(first, "page").value)} vs ${JSON.stringify(cell(last, "page").value)}`);
check("and neither of them reports that it chose",
  !cell(first, "page").refused && !cell(last, "page").refused,
  "both return a value and no complaint");
check("they agree on every field that carries exactly one value",
  ["q", "sort"].every((f) => cell(first, f).value === cell(last, f).value),
  "so the disagreement is about multiplicity, not about parsing");
say("        These are not two implementations of one rule. They are two rules");
say("        with the same call shape, and archaeology 014 measures both of them");
say("        in the standard library: get() keeps the first, Object.fromEntries");
say("        keeps the last.");

say("\n== 3. only a reader that knows the declaration can refuse");
const declared = readWith("declared-arity");
check("declared-arity refuses `page`", cell(declared, "page").refused,
  cell(declared, "page").because);
check("and does NOT refuse `tag`, which was declared many",
  !cell(declared, "tag").refused && Array.isArray(cell(declared, "tag").value),
  JSON.stringify(cell(declared, "tag").value));
check("nor `q`, which was declared optional and arrived once",
  !cell(declared, "q").refused, JSON.stringify(cell(declared, "q").value));
check("the other two readers refuse nothing, ever",
  first.refusals.length === 0 && last.refusals.length === 0);

say("\n== 3b. the drill: a reader that claims it can refuse and never does");
const liar = { READER: "claims-to-refuse", REFUSES: true,
  ON_MULTIPLICITY: "says it refuses", read: (values) => ({ value: values[0], refused: false }) };
const measured = ["q", "page", "tag", "sort"].map((f) =>
  liar.read(request.parse(QUERY)[f] ?? [], CONTRACT.fields[f].arity).refused);
check("a reader declaring REFUSES=true that never refuses is caught",
  liar.REFUSES === true && measured.every((r) => r === false),
  "declared it can refuse, refused nothing across four fields");

say("\n== 4. an empty field, and a field nobody sent");
const sparse = request.readAll("page=1", "declared-arity", CONTRACT.fields);
check("`q` declared optional-one and absent is accepted as null",
  !cell(sparse, "q").refused && cell(sparse, "q").value === null);
check("`sort` declared one and absent is refused",
  cell(sparse, "sort").refused, cell(sparse, "sort").because);
check("`tag` declared many and absent is an empty list, not a refusal",
  !cell(sparse, "tag").refused && JSON.stringify(cell(sparse, "tag").value) === "[]");

say("\n== 5. fail closed");
check("an unresolvable reader stops the run",
  Boolean(request.readAll(QUERY, "whatever-you-like", CONTRACT.fields).problem),
  request.readAll(QUERY, "whatever-you-like", CONTRACT.fields).problem);
check("SCL names a reader that exists", request.readerNames().includes(policy.reader()),
  policy.reader());
check("and it names one that can refuse",
  request.resolveReader(policy.reader()).module.REFUSES, policy.reader());

say("\n== 6. what this example does not solve");
say("        MEASURABLE, NOT MEASURED");
say("          - how often a repeated key in a real request is accident rather than design");
say("          - what refusing costs a caller who was relying on first-wins");
say("        NOT MEASURABLE HERE");
say("          - whether refusing is the right policy. Coercing, clamping and taking");
say("            the last are all defensible; choosing one without saying so is not,");
say("            and that is the only thing this example takes a position on.");
say("          - whether a declared arity is correct. Nothing here can tell a wrong");
say("            declaration from a wrong request.");

say(failures.length ? `\n${failures.length} failure(s)` : "\nall checks passed");
for (const f of failures) say(`  - ${f}`);
process.exit(failures.length ? 1 : 0);
