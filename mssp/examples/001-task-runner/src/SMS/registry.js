// SMS — how TMS modules get in.
//
// A registry is what makes "load one TMS alone" possible. Without it, main.js
// would import every handler and reporter directly, and the island test would
// have no way to construct a system with exactly one TMS present.

export function createRegistry() {
  const handlers = new Map();
  const reporters = new Map();

  return {
    /** Registering the same type twice is a wiring bug, not a last-one-wins. */
    addHandler(handler) {
      if (handlers.has(handler.type)) {
        throw new Error(`handler already registered for type: ${handler.type}`);
      }
      handlers.set(handler.type, handler);
      return this;
    },
    addReporter(reporter) {
      if (reporters.has(reporter.name)) {
        throw new Error(`reporter already registered: ${reporter.name}`);
      }
      reporters.set(reporter.name, reporter);
      return this;
    },
    handlerFor(type) {
      return handlers.get(type) ?? null;
    },
    reporterList() {
      return [...reporters.values()];
    },
    loaded() {
      return {
        handlers: [...handlers.keys()],
        reporters: [...reporters.keys()],
      };
    },
  };
}
