// The same three inputs, run under three different host policies.
//
// In commander 2.20.3 the first of these ends the process and the other two are
// not expressible.

import { parse } from "./SMS/parse.js";
import { cliPolicy, collectingPolicy, silentPolicy } from "./SCL/host-policy.js";
import { englishMessages } from "./TMS/messages/en.js";
import { chineseMessages } from "./TMS/messages/zh.js";
import { createTrace } from "./DMS/trace.js";

const SPEC = [
  { flags: "-p, --port", name: "port", takesValue: true },
  { flags: "-v, --verbose", name: "verbose", takesValue: false },
];

const CASES = [
  { label: "valid", argv: ["--port", "8080", "--verbose", "build"] },
  { label: "unknown option", argv: ["--porrt", "8080"] },
  { label: "option missing its value", argv: ["--port", "--verbose"] },
];

function run(policy, messages) {
  const trace = createTrace();
  const results = [];

  for (const testCase of CASES) {
    const result = parse(SPEC, testCase.argv, { required: [] });

    if (result.kind === "ok") {
      trace.record("parse.ok", { optionCount: Object.keys(result.options).length, argCount: result.args.length });
      results.push(`${testCase.label.padEnd(24)} ok    ${JSON.stringify(result.options)} args=${JSON.stringify(result.args)}`);
      continue;
    }

    const message = messages.render(result);
    trace.record("parse.error", { message });
    if (!policy.mayWrite) trace.record("policy.declined", { policy: policy.name, action: "write" });
    policy.onError(message);
    results.push(`${testCase.label.padEnd(24)} error ${result.code}`);
  }

  return { results, trace };
}

// A CLI policy that reports where the process would have died, rather than
// dying — so this file can demonstrate all three without ending early.
const wouldExit = [];
const reportingCli = cliPolicy({
  write: (text) => wouldExit.push(`stderr: ${text.trim()}`),
  exit: (code) => wouldExit.push(`process.exit(${code}) <- commander 2.20.3 stops here`),
});

for (const [policy, messages] of [
  [reportingCli, englishMessages()],
  [collectingPolicy(), chineseMessages()],
  [silentPolicy(), englishMessages()],
]) {
  console.log(`\n--- policy: ${policy.name} / messages: ${messages.name} ---`);
  const { results, trace } = run(policy, messages);
  for (const line of results) console.log(`  ${line}`);
  console.log("  DMS:");
  for (const line of trace.humanView().split("\n")) console.log(`    ${line}`);
  if (policy.name === "cli") for (const line of wouldExit) console.log(`    ${line}`);
  if (policy.written) for (const line of policy.written) console.log(`    collected: ${line}`);
}

console.log("\nSame parser, three hosts. The parse never decided whether to end the process.");
