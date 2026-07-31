// TMS — machine-readable report.
//
// The other half of the point. This module wants exactly what text.js wants:
// counts, totals, the slowest task. The tempting line is
//
//     import { summarise } from "./text.js";
//
// which would work, and would quietly make text.js a dependency of json.js —
// so the island test for json could never run without text present, and
// deleting text would break a module that has nothing to do with it.
//
// It reads the SMS-owned report instead. Neither reporter imports the other,
// and scripts/build-mssp.mjs greps for sibling-TMS imports to keep it that way.

import { defineReporter } from "../../SMS/model.js";

export function jsonReporter() {
  return defineReporter({
    name: "json",
    render(report) {
      return JSON.stringify(
        {
          passed: report.passed,
          counts: report.counts,
          totalMs: report.totalMs,
          slowest: report.slowest && { id: report.slowest.id, ms: report.slowest.ms },
          results: report.results,
        },
        null,
        2,
      );
    },
  });
}
