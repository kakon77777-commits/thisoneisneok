// SMS — the shared data contract.
//
// This file is the whole point of the example. Both reporters need the same
// derived numbers: per-task outcome, duration, and the run totals. The obvious
// move is to compute them in whichever reporter is written first and import
// that from the second. This is where they live instead.
//
// It is SMS by the identity test: delete it and there is nothing for the runner
// to hand to a reporter, nothing for a handler to return, and no shape for the
// trace to record. The system stops being a task runner.

/** @typedef {"ok" | "failed" | "skipped"} Outcome */

/** One task's result. Handlers produce this; nothing else constructs it. */
export function taskResult({ id, type, outcome, detail = "", ms = 0 }) {
  if (!id || !type) throw new Error("taskResult requires id and type");
  if (!["ok", "failed", "skipped"].includes(outcome)) {
    throw new Error(`unknown outcome: ${outcome}`);
  }
  return Object.freeze({ id, type, outcome, detail, ms });
}

/**
 * The run report. Every consumer reads these fields and no consumer recomputes
 * them — that is what stops a second reporter from reaching into the first.
 */
export function runReport(results) {
  const counts = { ok: 0, failed: 0, skipped: 0 };
  let totalMs = 0;
  for (const result of results) {
    counts[result.outcome] += 1;
    totalMs += result.ms;
  }
  return Object.freeze({
    results: Object.freeze([...results]),
    counts: Object.freeze(counts),
    totalMs,
    passed: counts.failed === 0,
    // Derived here rather than in a reporter. The moment one reporter owns a
    // derived field, every other reporter either imports it or drifts from it.
    slowest: results.reduce((worst, r) => (!worst || r.ms > worst.ms ? r : worst), null),
  });
}

/**
 * The interface a handler TMS binds to. Declared in SMS so a handler never has
 * to know which other handlers exist.
 */
export function defineHandler({ type, run }) {
  if (typeof run !== "function") throw new Error("handler needs a run function");
  return Object.freeze({ type, run });
}

/** The interface a reporter TMS binds to. */
export function defineReporter({ name, render }) {
  if (typeof render !== "function") throw new Error("reporter needs a render function");
  return Object.freeze({ name, render });
}
