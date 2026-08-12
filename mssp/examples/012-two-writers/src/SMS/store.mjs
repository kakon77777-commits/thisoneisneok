// The store: resolve a medium and an operation by id, and refuse a mismatch.
//
// The one rule this example adds: an operation declares what it REQUIRES, a
// medium declares what it GUARANTEES, and the store compares them before
// anything runs. A requirement nothing provides is refused rather than
// discovered by an interleaving in production.
import * as atomicFile from "../TMS/media/atomic_file.mjs";
import * as tornFile from "../TMS/media/torn_file.mjs";
import * as compareAndSet from "../TMS/operations/compare_and_set.mjs";
import * as readModifyWrite from "../TMS/operations/read_modify_write.mjs";

const MEDIA = Object.fromEntries(
  [atomicFile, tornFile].map((module) => [module.MEDIUM, module]));
const OPERATIONS = Object.fromEntries(
  [readModifyWrite, compareAndSet].map((module) => [module.OPERATION, module]));

export const mediaNames = () => Object.keys(MEDIA).sort();
export const operationNames = () => Object.keys(OPERATIONS).sort();

export function resolveMedium(name) {
  const module = MEDIA[name];
  if (!module) return { problem: `medium "${name}" has no implementation - fail closed (known: ${mediaNames().join(", ")})` };
  return { module };
}

export function resolveOperation(name) {
  const module = OPERATIONS[name];
  if (!module) return { problem: `operation "${name}" has no implementation - fail closed (known: ${operationNames().join(", ")})` };
  return { module };
}

// The comparison. Two declarations, and the one thing that makes it more than
// two labels agreeing is that section 5 of the island test proves each of them
// against behaviour before this is consulted.
export function unmetRequirements(operation, medium) {
  return operation.REQUIRES.filter((need) => !medium.GUARANTEES.includes(need));
}

export function open({ mediumName, operationName, dir, allowUnmet = false }) {
  const medium = resolveMedium(mediumName);
  if (medium.problem) return { problem: medium.problem };
  const operation = resolveOperation(operationName);
  if (operation.problem) return { problem: operation.problem };

  const unmet = unmetRequirements(operation.module, medium.module);
  if (unmet.length && !allowUnmet) {
    return {
      problem: `${operationName} requires ${unmet.join(", ")}; ${mediumName} guarantees `
        + `${medium.module.GUARANTEES.join(", ") || "nothing"} - fail closed`,
      unmet,
    };
  }

  const handle = medium.module.make({ dir });
  return {
    unmet,
    store: {
      medium: mediumName,
      operation: operationName,
      seed(key, record) { for (const write of handle.writeSteps(key, JSON.stringify(record))) write(); },
      read(key) { const raw = handle.read(key); return raw === null ? null : JSON.parse(raw); },
      raw: (key) => handle.read(key),
      // A writer is not run here. It is a list of steps, so a schedule decides
      // when each one happens.
      writer: (key, change) => operation.module.steps(handle, key, change),
    },
  };
}
