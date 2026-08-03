// Rewrites a `phone` field into E.164-ish form.
//
// In the shipped fixture this transform is never invoked, because none of the
// records carries a phone number. That is deliberate: it is the capability the
// ledger has to be able to talk about, and a report that cannot distinguish
// "ran and changed nothing" from "never ran" is the thing this example argues
// against.

import { APPLIED, outcome, UNCHANGED } from "../../SMS/model.js";

export const name = "transforms/normalise-phone";

export const normalisePhone = {
  name,

  applies(record) {
    return typeof record.fields.phone === "string" && record.fields.phone.trim() !== "";
  },

  apply(record) {
    const digits = record.fields.phone.replace(/[^\d+]/g, "");
    const normalised = digits.startsWith("+") ? digits : `+886${digits.replace(/^0/, "")}`;
    if (normalised === record.fields.phone) {
      return outcome(UNCHANGED, {
        by: name, id: record.id, before: record, reason: "already normalised",
      });
    }
    return outcome(APPLIED, {
      by: name, id: record.id, before: record,
      after: { id: record.id, fields: { ...record.fields, phone: normalised } },
    });
  },
};
