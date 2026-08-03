// Event in, delivered or not, with a reason either way.
//
// The four axes upstream, kept: the logger decides whether to emit, filters
// decide whether it survives, the formatter decides how it reads, the sink
// decides where it goes. Each is a value passed in.
//
// The one change is the return type. Upstream a log call returns None, so
// "delivered", "filtered out", "below threshold" and "no handler configured"
// are all the same observation from the caller's side.

import { LEVELS } from "./record.js";

export function emit(record, { threshold = "debug", filters = [], format, sinks = [] }) {
  if (record.severity < LEVELS[threshold]) {
    return { delivered: false, why: `below threshold ${threshold}`, sinks: [] };
  }
  for (const filter of filters) {
    if (!filter.allows(record)) {
      return { delivered: false, why: `refused by ${filter.name}`, sinks: [] };
    }
  }
  if (sinks.length === 0) {
    // The case upstream cannot report: correctly configured, correctly
    // filtered, and nowhere to go.
    return { delivered: false, why: "no sink configured", sinks: [] };
  }
  const text = format(record);
  for (const sink of sinks) sink.write(text);
  return { delivered: true, why: "", sinks: sinks.map((s) => s.name), text };
}
