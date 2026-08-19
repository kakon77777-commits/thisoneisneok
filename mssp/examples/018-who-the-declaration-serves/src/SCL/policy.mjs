import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
export const POLICY = JSON.parse(fs.readFileSync(path.join(here, "policy.json"), "utf8"));

export const policyName = () => POLICY.policy;
export const assumption = () => POLICY.assumes_declarations_are;
export const isFatal = () => POLICY.on_contradiction === "fatal";
export const describe = () =>
  `${POLICY.deployment}: apply ${POLICY.policy}, assuming declarations are ${POLICY.assumes_declarations_are}`;

// The assumption, made checkable. A self-penalising declaration must not leave
// the unit that made it better off than suppressing it would have.
export function contradicts(measured) {
  if (POLICY.assumes_declarations_are !== "self-penalising") return null;
  return measured.delta > 0
    ? `declaring left ${measured.source} better off by ${measured.delta} record(s) `
      + `(${measured.suppressed} suppressed -> ${measured.declared} declared)`
    : null;
}
