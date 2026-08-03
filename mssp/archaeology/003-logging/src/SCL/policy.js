import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const policy = JSON.parse(fs.readFileSync(path.join(here, "policy.json"), "utf8"));

export class PermissionError extends Error {}

export function mayConfigure(capability) {
  return Boolean(policy.capabilities[capability]?.may_configure);
}

export function assertMayConfigure(capability) {
  if (!mayConfigure(capability)) {
    throw new PermissionError(`${capability} may not configure logging (may_configure: false)`);
  }
}
