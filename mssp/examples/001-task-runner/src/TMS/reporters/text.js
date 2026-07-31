// TMS — human-readable report.
//
// This is one half of the example's point. Both reporters need per-task
// duration, the counts, and which task was slowest. None of that is computed
// here: it is read from the report SMS built.

import { defineReporter } from "../../SMS/model.js";

export function textReporter() {
  return defineReporter({
    name: "text",
    render(report) {
      const lines = report.results.map(
        (r) => `  ${r.outcome.padEnd(7)} ${r.id.padEnd(14)} ${String(r.ms).padStart(4)}ms  ${r.detail}`,
      );
      const { ok, failed, skipped } = report.counts;
      return [
        "RUN REPORT",
        ...lines,
        "",
        `  ${ok} ok, ${failed} failed, ${skipped} skipped in ${report.totalMs}ms`,
        report.slowest ? `  slowest: ${report.slowest.id} (${report.slowest.ms}ms)` : "  slowest: n/a",
        `  result: ${report.passed ? "PASS" : "FAIL"}`,
      ].join("\n");
    },
  });
}
