// The shapes the sets agree on.
export const KEPT = "kept";
export const DROPPED = "dropped";

export function reading(sensor, celsius, at) {
  return { sensor, celsius, at };
}

export function summaryRow(sensor, values) {
  return {
    sensor,
    n: values.length,
    mean: Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)),
    min: Math.min(...values),
    max: Math.max(...values),
  };
}
