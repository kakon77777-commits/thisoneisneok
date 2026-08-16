// Deployment policy. Which combiner this deployment runs, and what a run that
// did not finish means here.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
export const POLICY = JSON.parse(fs.readFileSync(path.join(here, "policy.json"), "utf8"));

export const combinerName = () => POLICY.combiner;
export const isFatal = () => POLICY.on_partial === "fatal";
export const describe = () =>
  `${POLICY.deployment}: combine with ${POLICY.combiner}, a partial run is ${POLICY.on_partial}`;
