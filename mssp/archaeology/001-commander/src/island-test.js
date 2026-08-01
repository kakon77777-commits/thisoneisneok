// Island test. Run: node src/island-test.js
//
// The claim being tested is the one the re-cut exists for: the parser decides
// nothing about the host, and either message renderer works without the other.

import assert from "node:assert/strict";
import { parse, ERROR } from "./SMS/parse.js";
import { silentPolicy, collectingPolicy } from "./SCL/host-policy.js";
import { chineseMessages } from "./TMS/messages/zh.js";

let failures = 0;
function check(name, fn) {
  try {
    fn();
    console.log(`  [OK]   ${name}`);
  } catch (error) {
    failures += 1;
    console.log(`  [FAIL] ${name} — ${error.message}`);
  }
}

const SPEC = [
  { flags: "-p, --port", name: "port", takesValue: true },
  { flags: "-v, --verbose", name: "verbose", takesValue: false },
];

console.log("island test: SMS/parse alone, no policy and no renderer loaded");

check("a valid parse returns a value", () => {
  const r = parse(SPEC, ["--port", "8080", "build"]);
  assert.equal(r.kind, "ok");
  assert.deepEqual(r.options, { port: "8080" });
  assert.deepEqual(r.args, ["build"]);
});

check("an unknown option is data, not an exit", () => {
  const r = parse(SPEC, ["--porrt"]);
  assert.equal(r.kind, "error");
  assert.equal(r.code, ERROR.UNKNOWN_OPTION);
  assert.equal(r.detail.flag, "--porrt");
});

check("a missing option value is data, not an exit", () => {
  const r = parse(SPEC, ["--port", "--verbose"]);
  assert.equal(r.kind, "error");
  assert.equal(r.code, ERROR.MISSING_OPTION_ARGUMENT);
});

check("allowUnknown keeps the token instead of failing", () => {
  const r = parse(SPEC, ["--porrt"], { allowUnknown: true });
  assert.equal(r.kind, "ok");
  assert.deepEqual(r.args, ["--porrt"]);
});

check("parse touches no host global", () => {
  // If parse called process.exit the way commander does, this test file would
  // end here and the remaining checks would never print — which is exactly the
  // failure mode that makes the original hard to unit test.
  const original = process.exit;
  let called = false;
  process.exit = () => { called = true; };
  parse(SPEC, ["--porrt"]);
  parse(SPEC, ["--port"]);
  process.exit = original;
  assert.equal(called, false);
});

console.log("\nisland test: TMS/messages/zh alone, English renderer never imported");

check("the Chinese renderer works with no sibling loaded", () => {
  const r = parse(SPEC, ["--porrt"]);
  const text = chineseMessages().render(r);
  assert.match(text, /無法辨識的選項/);
});

check("a silent policy performs no effect at all", () => {
  const policy = silentPolicy();
  assert.equal(policy.mayWrite, false);
  assert.equal(policy.mayExit, false);
  policy.onError("anything");
});

check("a collecting policy captures instead of exiting", () => {
  const policy = collectingPolicy();
  policy.onError("unknown option `--porrt'");
  assert.equal(policy.written.length, 1);
  assert.equal(policy.mayExit, false);
});

console.log(failures ? `\n${failures} check(s) failed` : "\nall island checks passed");
process.exit(failures ? 1 : 0);
