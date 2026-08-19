// Three sources, two defensible policies, and one declaration whose direction
// depends entirely on which policy is in force.
//
//   node src/main.mjs             the run under the policy SCL names
//   node src/main.mjs --compare   both policies, side by side
//   node src/main.mjs --strict    exit 1 when the measurement contradicts SCL's assumption
import * as report from "./DMS/report.mjs";
import * as policy from "./SCL/policy.mjs";
import * as pipeline from "./SMS/pipeline.mjs";

const say = (line = "") => process.stdout.write(`${line}\n`);

function measure(policyModule, sources) {
  return Object.keys(sources).sort()
    .map((name) => ({ source: name, ...pipeline.incentive(policyModule, sources, name) }));
}

function main(argv) {
  const { sources, policies, problems } = pipeline.load();
  if (problems.length > 0) {
    for (const problem of problems) say(`  REFUSED: ${problem}`);
    return 1;
  }

  if (argv.includes("--compare")) {
    say("\n  the same three sources, the same data, two defensible policies:\n");
    for (const name of Object.keys(policies).sort()) {
      const module = policies[name];
      say(`  ${name} - ${module.WHAT_IT_DOES_WITH_A_DECLARATION}`);
      say(report.rows(pipeline.through(module, sources)));
      say("");
      say(report.incentives(measure(module, sources)));
      say("");
    }
    say("  Same declaration. Opposite direction. Neither policy is unreasonable.");
    return 0;
  }

  const inForce = policies[policy.policyName()];
  const result = pipeline.through(inForce, sources);
  const measured = measure(inForce, sources);

  say(`\n  ${policy.describe()}\n`);
  say(report.rows(result));
  say("");
  say(report.incentives(measured));

  const contradictions = measured.map((m) => policy.contradicts(m)).filter(Boolean);
  if (contradictions.length > 0) {
    say("");
    for (const line of contradictions) say(`  CONTRADICTS SCL: ${line}`);
    say(`  SCL assumes declarations are ${policy.assumption()}; under this policy they are not.`);
  }

  if (argv.includes("--strict") && contradictions.length > 0 && policy.isFatal()) {
    say(`\n  --strict: the measurement contradicts a written assumption and that is fatal here`);
    return 1;
  }
  return 0;
}

process.exitCode = main(process.argv.slice(2));
