// Splits a single `name` field into `given_name` and `family_name`.
//
// Declines anything without a `name`, and declines a name it cannot split
// rather than guessing — a decline is a recorded answer, so declining is not
// the same as doing nothing.

import { APPLIED, outcome, UNCHANGED } from "../../SMS/model.js";

export const name = "transforms/split-name";

export const splitName = {
  name,

  applies(record) {
    return typeof record.fields.name === "string" && record.fields.name.trim() !== "";
  },

  apply(record) {
    const parts = record.fields.name.trim().split(/\s+/);
    if (parts.length < 2) {
      return outcome(UNCHANGED, {
        by: name, id: record.id, before: record,
        reason: "one token only; splitting it would be a guess",
      });
    }
    const family = parts.pop();
    const after = {
      id: record.id,
      fields: { ...record.fields, given_name: parts.join(" "), family_name: family },
    };
    delete after.fields.name;
    return outcome(APPLIED, { by: name, id: record.id, before: record, after });
  },
};
