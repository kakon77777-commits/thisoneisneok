// Whether a renderer may take a token type another renderer already owns.
//
// marked has no equivalent: every caller may replace anything, silently.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(fs.readFileSync(path.join(here, "policy.json"), "utf8"));

export function mayReplace(who) {
  return Boolean(config.renderers[who]?.may_replace);
}
