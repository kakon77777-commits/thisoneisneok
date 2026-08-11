// Which medium and handout this deployment uses, and what it refuses to ship.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(fs.readFileSync(path.join(here, "policy.json"), "utf8"));

export const medium = () => config.medium;
export const handout = () => config.handout;
export const liveReferenceIsFatal = () => Boolean(config.live_reference_is_fatal);
