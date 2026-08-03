// Keeps lines in memory so a test can read them.
//
// Independent of sinks/text and unaware of it. Both exist because a sink set is
// a list the caller supplies, so a test supplies one and gets no console noise.

export const name = "sinks/collect";

export function collectSink() {
  const lines = [];
  return { name, lines, write: (text) => lines.push(text) };
}
