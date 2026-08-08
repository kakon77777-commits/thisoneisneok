import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(fs.readFileSync(path.join(here, "policy.json"), "utf8"));

export const currentVersion = () => config.current_version;
export const enabled = () => [...config.enabled];
export const mayOpenAlias = (actor) => config.may_open_alias.includes(actor);
export const maxWindowVersions = () => config.max_window_versions;

/** Major-version distance, which is all this example's versions need. */
export function majorsBetween(from, to) {
  return Number(to.split(".")[0]) - Number(from.split(".")[0]);
}
