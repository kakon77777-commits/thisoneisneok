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

import { record } from "./registry.js";
import { resolveImplementation } from "./observers.js";

// Metron ran this on 2026-08-08 with observer: "observer-that-does-not-exist"
// and got {holds: true, problems: []}. The observer name was a label — the
// function always called the one hard-coded comparator below, so what this
// file proved was "this comparator passes", not "the declared contract holds".
// In an example whose entire claim is that a declaration must be checked, the
// declaration was not checked. It now fails closed.
function resolveObserver(alias) {
  const name = alias?.equivalence?.observer;
  if (!name) return { problems: ["no observer named in the equivalence clause"] };
  const observer = record.observers?.[name];
  if (!observer) {
    return { problems: [`observer "${name}" does not resolve in FMS — fail closed`] };
  }
  // Metron, 2026-08-09: resolving the id was not enough. The verdict has to be
  // produced BY the implementation that id names, or the check still only
  // proves "the one comparator in this file passes".
  const bound = resolveImplementation(name);
  if (bound.problem) return { problems: [bound.problem] };

  const problems = [];
  for (const delta of alias.equivalence.allowed_deltas ?? []) {
    const head = String(delta).split(".")[0];
    if (!observer.observations.includes(head)) {
      problems.push(`allowed_delta "${delta}" is not an observation of ${name}`);
    }
    if (observer.non_waivable.includes(head)) {
      problems.push(`"${delta}" names ${head}, which ${name} declares non-waivable`);
    }
  }
  return { observer, observe: bound.implementation, problems };
}

export function checkAlias(alias, oldRule, newRule, fixture, currentVersion, majorsBetween, maxWindow) {
  const problems = [];

  // Fail closed before anything is compared. A contract whose observer cannot
  // be resolved has not been checked, and reporting "holds" for it is worse
  // than reporting nothing.
  const resolved = resolveObserver(alias);
  problems.push(...resolved.problems);
  if (!resolved.observer) return { alias, holds: false, problems, deltas: [] };

  if (!oldRule) problems.push(`the old name has nothing behind it`);
  if (!newRule) problems.push(`the replacement ${alias.replacement} does not exist`);
  if (problems.length) return { alias, holds: false, problems, deltas: [] };

  const before = resolved.observe(oldRule, fixture);
  const after = resolved.observe(newRule, fixture);

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
