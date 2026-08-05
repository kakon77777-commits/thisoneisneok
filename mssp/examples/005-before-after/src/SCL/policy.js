import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(fs.readFileSync(path.join(here, "policy.json"), "utf8"));

export function plausible() {
  return config.plausible_celsius;
}

export function mayProduce(format) {
  return Boolean(config.formats[format]?.may_produce);
}

/** Every format this deployment recognises. Adding one is a policy line. */
export function known() {
  return Object.keys(config.formats);
}
