// Per-sensor statistics. Core: it is the report's content.
import { summaryRow } from "./model.js";

export function summarise(rows) {
  const bySensor = new Map();
  for (const row of rows) {
    if (!bySensor.has(row.sensor)) bySensor.set(row.sensor, []);
    bySensor.get(row.sensor).push(row.celsius);
  }
  return [...bySensor.entries()].map(([sensor, values]) => summaryRow(sensor, values));
}
