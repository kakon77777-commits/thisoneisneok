// Which readings survive. Core: without it the report describes bad data.
//
// The bounds come from SCL rather than from a constant here, because "what
// counts as plausible" is a decision about the deployment, not about the
// arithmetic — a roof sensor in a furnace room has different bounds and that is
// a configuration change, not a code change.
import { plausible } from "../SCL/policy.js";

export function validate(rows) {
  const { min, max } = plausible();
  const kept = [];
  const dropped = [];
  for (const row of rows) {
    if (row.celsius === null || row.celsius === undefined) dropped.push({ row, why: "no reading" });
    else if (row.celsius < min || row.celsius > max) dropped.push({ row, why: `outside ${min}..${max}` });
    else kept.push(row);
  }
  return { kept, dropped };
}
