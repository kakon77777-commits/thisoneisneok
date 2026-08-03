// What each transform is permitted to do.
//
// The interesting entry is `may_drop`. Rewriting a field and removing a record
// look identical in code — both are a function returning an outcome — and only
// one of them loses data. Permission is the axis that tells them apart, so it
// is data a runtime reads rather than a rule a transform agrees to follow.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const policy = JSON.parse(fs.readFileSync(path.join(here, "policy.json"), "utf8"));

export const TRANSFORMS = policy.transforms;

export class PermissionError extends Error {}

export function mayDrop(name) {
  return Boolean(TRANSFORMS[name]?.may_drop);
}

export function assertMayDrop(name) {
  if (!mayDrop(name)) {
    throw new PermissionError(`${name} returned a drop, and its policy entry says may_drop: false`);
  }
}

/** Fields a transform declares it reads. Used by DMS to explain a zero. */
export function declaredReads(name) {
  return TRANSFORMS[name]?.reads ?? [];
}
