// SMS — the task loop.
//
// Removing this ends the system's identity, so it is core by the identity test.
// It knows about the registry, the model, permissions, and the trace. It knows
// nothing about any specific handler or reporter.

import { runReport, taskResult } from "./model.js";
import { permits } from "../SCL/permissions.js";

export async function runTasks({ tasks, registry, trace, clock = () => Date.now() }) {
  const results = [];

  for (const task of tasks) {
    // Permission is checked BEFORE capability, and the order is load-bearing.
    //
    // The reverse order reads more naturally — why consult policy for something
    // you cannot do anyway? — but it makes the policy's answer depend on which
    // TMS happen to be loaded. `file.delete` is denied outright here; with the
    // checks reversed it reported "no handler loaded", which is true today and
    // becomes silently wrong the moment someone registers a delete handler.
    //
    // SCL is also consulted in the core, not inside each handler. A handler that
    // policed its own permissions could simply decide not to.
    const decision = permits(task);
    if (!decision.allowed) {
      trace.record("permission.denied", { id: task.id, type: task.type, reason: decision.reason });
      results.push(taskResult({ id: task.id, type: task.type, outcome: "skipped", detail: `denied: ${decision.reason}` }));
      continue;
    }

    const handler = registry.handlerFor(task.type);
    if (!handler) {
      // A missing handler is a normal outcome, not a crash: the whole premise
      // of on-demand loading is that some capabilities are absent by design.
      trace.record("handler.missing", { id: task.id, type: task.type });
      results.push(taskResult({ id: task.id, type: task.type, outcome: "skipped", detail: "no handler loaded for this type" }));
      continue;
    }

    const started = clock();
    try {
      const detail = await handler.run(task);
      results.push(taskResult({ id: task.id, type: task.type, outcome: "ok", detail, ms: clock() - started }));
      trace.record("task.ok", { id: task.id, type: task.type });
    } catch (error) {
      results.push(taskResult({ id: task.id, type: task.type, outcome: "failed", detail: error.message, ms: clock() - started }));
      trace.record("task.failed", { id: task.id, type: task.type, error: error.message });
    }
  }

  return runReport(results);
}
