// Which reader this deployment uses, and what it refuses to serve.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(fs.readFileSync(path.join(here, "policy.json"), "utf8"));

export const reader = () => config.reader;
export const refusalIsFatal = () => Boolean(config.a_refusal_is_fatal);
