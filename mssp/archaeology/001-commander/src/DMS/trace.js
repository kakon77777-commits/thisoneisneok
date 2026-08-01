// DMS — what the parse did, separate from what it returned.
//
// commander 2.x has no equivalent. A failed parse ends the process, so there is
// nothing left to inspect: the exit code is the entire report.

export function createTrace() {
  const events = [];
  return {
    record(event, data = {}) { events.push({ event, ...data }); },
    events: () => [...events],
    humanView() {
      if (!events.length) return "Nothing recorded.";
      return events.map((e) => {
        if (e.event === "parse.ok") return `Parsed ${e.optionCount} option(s) and ${e.argCount} argument(s).`;
        if (e.event === "parse.error") return `Rejected: ${e.message}`;
        if (e.event === "policy.declined") return `Policy "${e.policy}" declined to ${e.action}.`;
        return e.event;
      }).join("\n");
    },
  };
}
