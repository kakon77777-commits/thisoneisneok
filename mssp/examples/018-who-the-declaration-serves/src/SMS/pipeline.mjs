// Run the sources, apply the policy SCL names, and measure the incentive.
//
// The measurement is the point. Example 017 asserted that a unit declaring
// itself incomplete is penalising itself, and called that a reason to take the
// declaration on trust. That was a judgement about incentives, not a property
// of anything in the code — so this module computes it instead.
//
//   incentive(unit) = what the unit contributes WITH its declaration
//                   - what it contributes with the declaration SUPPRESSED
//
// Negative means declaring cost the unit. Positive means declaring paid.
import * as fullPage from "../TMS/sources/full_page.mjs";
import * as honestPage from "../TMS/sources/honest_page.mjs";
import * as silentPage from "../TMS/sources/silent_page.mjs";
import * as refuseDeclared from "../TMS/policies/refuse_declared.mjs";
import * as retryDeclared from "../TMS/policies/retry_declared.mjs";

const SOURCE_MODULES = [fullPage, honestPage, silentPage];
const POLICY_MODULES = [refuseDeclared, retryDeclared];

export function load(extraSources = [], extraPolicies = []) {
  const sources = {};
  const policies = {};
  const problems = [];

  for (const module of [...SOURCE_MODULES, ...extraSources]) {
    for (const attribute of ["NAME", "CAN_FAIL_WITH", "HELD", "collect"]) {
      if (module[attribute] === undefined) problems.push(`a source does not declare ${attribute}`);
    }
    if (!module.CAN_FAIL_WITH?.length) {
      problems.push(`${module.NAME}: CAN_FAIL_WITH is empty`);
    }
    for (const vouch of ["COMPLETE", "IS_COMPLETE", "RETURNS_EVERYTHING"]) {
      if (module[vouch] === true) {
        problems.push(`${module.NAME}: declares ${vouch} - a unit may declare itself incomplete `
          + `and may not declare itself complete (改良點 15)`);
      }
    }
    sources[module.NAME] = module;
  }

  for (const module of [...POLICY_MODULES, ...extraPolicies]) {
    if (!module.WHAT_IT_DOES_WITH_A_DECLARATION) {
      problems.push(`${module.POLICY}: does not say what it does with a declaration`);
    }
    policies[module.POLICY] = module;
  }
  return { sources, policies, problems };
}

export function runOne(module, budget = 1, { suppressDeclaration = false } = {}) {
  const result = module.collect({ budget });
  return {
    source: module.NAME,
    held: module.HELD,
    records: result.records,
    incomplete_because: suppressDeclaration ? null : result.incomplete_because,
    suppressed: suppressDeclaration && result.incomplete_because !== null,
  };
}

export function runAll(sources, { suppress = [] } = {}) {
  return Object.keys(sources).sort()
    .map((name) => runOne(sources[name], 1, { suppressDeclaration: suppress.includes(name) }));
}

export function through(policyName, sources, options = {}) {
  const policy = policyName;
  const runs = runAll(sources, options);
  const rerun = (name, budget) => runOne(sources[name], budget);
  const applied = policy.apply(runs, rerun);
  return {
    rows: applied,
    total: applied.reduce((n, row) => n + row.kept.length, 0),
  };
}

export function contribution(result, name) {
  return result.rows.find((row) => row.source === name)?.kept.length ?? 0;
}

// The counterfactual. Same policy, same data, one declaration removed.
export function incentive(policy, sources, name) {
  const declared = contribution(through(policy, sources), name);
  const suppressed = contribution(through(policy, sources, { suppress: [name] }), name);
  return { declared, suppressed, delta: declared - suppressed };
}
