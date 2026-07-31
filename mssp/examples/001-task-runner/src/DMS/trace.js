// DMS — what happened, and what a human can see about it.
//
// Separate from the reporters on purpose. A reporter renders the *result*; the
// trace records the *run* — including the parts that never reach a result, like
// a task skipped because no handler was loaded or a permission was refused.
// Without it, "2 skipped" is a number with no explanation attached.

export function createTrace() {
  const events = [];
  return {
    record(event, data = {}) {
      events.push({ event, ...data });
    },
    /** Machine view: for tests and tooling. */
    events: () => [...events],
    /** Human view: the sentences a person needs to trust the run. */
    humanView(registry) {
      const loaded = registry.loaded();
      const denied = events.filter((e) => e.event === "permission.denied");
      const missing = events.filter((e) => e.event === "handler.missing");
      const lines = [
        `Loaded handlers: ${loaded.handlers.join(", ") || "none"}`,
        `Loaded reporters: ${loaded.reporters.join(", ") || "none"}`,
      ];
      for (const e of missing) lines.push(`Skipped ${e.id}: no handler for "${e.type}" was loaded.`);
      for (const e of denied) lines.push(`Refused ${e.id}: ${e.reason}.`);
      if (!missing.length && !denied.length) lines.push("Nothing was skipped or refused.");
      return lines.join("\n");
    },
  };
}
