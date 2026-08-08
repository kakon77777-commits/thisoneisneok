// Checking a declared equivalence, rather than inferring one.
//
// Metron's point in mssp-d-001: "兩者公開介面相同" cannot be a general
// mechanical criterion. In a dynamic language the full interface includes
// behaviour, errors, metadata and side effects, and here the two objects are
// DELIBERATELY different — the old name must carry deprecated: true. Demand
// total equality and every legitimate alias fails; compare only exported keys
// and behavioural drift reads as equality.
//
// So the machine does not decide what "the same" means. It checks whether
// reality matches a sameness someone declared, under a named observer, with the
// permitted differences written down in advance.

import { apply } from "./registry.js";

const at = (object, dotted) =>
  dotted.split(".").reduce((cursor, key) => (cursor == null ? cursor : cursor[key]), object);

/** rule-contract-v1: findings per line, plus every meta field. */
function observe(rule, fixture) {
  return {
    findings: apply(rule, fixture).map((f) => `${f.line}:${f.message}`),
    meta: rule.meta ?? {},
  };
}

export function checkAlias(alias, oldRule, newRule, fixture, currentVersion, majorsBetween, maxWindow) {
  const problems = [];
  if (!oldRule) problems.push(`the old name has nothing behind it`);
  if (!newRule) problems.push(`the replacement ${alias.replacement} does not exist`);
  if (problems.length) return { alias, holds: false, problems, deltas: [] };

  const before = observe(oldRule, fixture);
  const after = observe(newRule, fixture);

  // Behaviour is never in allowed_deltas by construction: the observer's whole
  // purpose is that findings must agree. Saying otherwise would make the
  // contract unfalsifiable, which is the shape this field lab keeps finding.
  const deltas = [];
  if (before.findings.join("|") !== after.findings.join("|")) {
    problems.push("findings differ");
    deltas.push({ field: "findings", old: before.findings, new: after.findings });
  }

  const keys = new Set([...Object.keys(before.meta), ...Object.keys(after.meta)]);
  for (const key of keys) {
    const path = `meta.${key}`;
    const a = JSON.stringify(before.meta[key]);
    const b = JSON.stringify(after.meta[key]);
    if (a === b) continue;
    if (alias.equivalence.allowed_deltas.includes(path)) {
      deltas.push({ field: path, old: before.meta[key], new: after.meta[key], allowed: true });
      continue;
    }
    problems.push(`${path} differs and is not in allowed_deltas`);
    deltas.push({ field: path, old: before.meta[key], new: after.meta[key] });
  }

  // Module 06 as something a run can check: replacement before removal, and a
  // window that does not outlive the policy's limit.
  const overdue = majorsBetween(alias.sunset, currentVersion) >= 0;
  if (overdue) problems.push(`past sunset ${alias.sunset} (current ${currentVersion})`);
  if (majorsBetween(alias.valid_from, alias.sunset) > maxWindow) {
    problems.push(`window ${alias.valid_from}..${alias.sunset} exceeds the permitted ${maxWindow} major(s)`);
  }

  return { alias, holds: problems.length === 0, problems, deltas };
}
