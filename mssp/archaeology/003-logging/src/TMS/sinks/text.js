// Writes formatted lines to a stream it is given.
//
// Upstream's StreamHandler already takes its stream as an argument, which is
// the part that is right: the sink does not name a destination, it is handed
// one. That is why this file is short — there was nothing to repair.

export const name = "sinks/text";

export function textSink(write) {
  return { name, write };
}
