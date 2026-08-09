// Observer implementations, resolved by the id the record names.
//
// Metron, 2026-08-09, on yesterday's repair:
//
//   現在 resolveObserver() 會確認 id 存在於 FMS；但實際執行仍固定呼叫檔案裡唯一的
//   observe()。… 所以修復目前保證的是「id 必須存在」，還不是「verdict 由該 id 所指
//   的 observer implementation 產生」。
//
// They added a resolvable `different-observer-v2`, pointed an alias at it, and
// got holds: true from the rule-contract-v1 comparator. With one observer that
// is not yet a wrong answer; the moment mssp-d-002 starts versioning observers
// it becomes one.
//
// So an observer is a function here, not a description. An id in the record
// with nothing behind it fails closed, the same way a predicate id does.

import { apply } from "./registry.js";

/** rule-contract-v1: findings per fixture line, plus every meta field. */
function ruleContractV1(rule, fixture) {
  return {
    findings: apply(rule, fixture).map((f) => `${f.line}:${f.message}`),
    meta: rule.meta ?? {},
  };
}

/**
 * rule-contract-v2: the same, plus the rule's own id.
 *
 * It exists so the dispatcher has something to be wrong about. Under v1 two
 * rules with different ids and identical behaviour are equivalent; under v2
 * they are not, and the island test uses exactly that difference to prove the
 * verdict came from the named observer rather than from the only one there is.
 */
function ruleContractV2(rule, fixture) {
  return {
    findings: apply(rule, fixture).map((f) => `${f.line}:${f.message}`),
    meta: { ...(rule.meta ?? {}), id: rule.id },
  };
}

export const IMPLEMENTATIONS = {
  "rule-contract-v1": ruleContractV1,
  "rule-contract-v2": ruleContractV2,
};

export function resolveImplementation(name) {
  const implementation = IMPLEMENTATIONS[name];
  if (!implementation) {
    return { problem: `observer "${name}" has no implementation — fail closed` };
  }
  return { implementation };
}
