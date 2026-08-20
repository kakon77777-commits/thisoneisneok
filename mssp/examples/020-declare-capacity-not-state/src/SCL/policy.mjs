import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
export const POLICY = JSON.parse(fs.readFileSync(path.join(here, "policy.json"), "utf8"));

export const refusesLiars = () => POLICY.a_reader_that_fails_its_challenge_is === "refused";
export const servesBlind = () => POLICY.records_from_a_blind_reader_are.startsWith("served");
export const describe = () =>
  `${POLICY.deployment}: a reader that fails its challenge is ${POLICY.a_reader_that_fails_its_challenge_is}, `
  + `records from a blind reader are ${POLICY.records_from_a_blind_reader_are}`;
