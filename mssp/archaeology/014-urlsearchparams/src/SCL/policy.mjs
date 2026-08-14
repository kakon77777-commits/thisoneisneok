import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(fs.readFileSync(path.join(here, "policy.json"), "utf8"));

export const accessor = () => config.accessor_used_for_a_single_value_field;
export const silentDiscardIsFatal = () => Boolean(config.a_one_value_accessor_on_a_multi_value_key_is_fatal);
