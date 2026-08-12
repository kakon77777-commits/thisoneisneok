// Which medium and operation this deployment runs, and what it refuses to ship.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(fs.readFileSync(path.join(here, "policy.json"), "utf8"));

export const medium = () => config.medium;
export const operation = () => config.operation;
export const unmetIsFatal = () => Boolean(config.unmet_requirement_is_fatal);
