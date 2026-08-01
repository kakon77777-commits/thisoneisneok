// SCL — what this parser is permitted to do to its host, and who decides.
//
// In commander 2.20.3 this layer does not exist. The permission to write to
// stderr and to terminate the process is taken unconditionally at eight call
// sites, and the calling program has no way to withhold it. That is the
// knowledge/permission fusion the method warns about: the library knows the
// input is malformed, but nothing granted it the right to end the process.
//
// Making the policy a value has an effect that is easy to miss: the same parser
// now works in a CLI, in a test, and inside a long-running process, without the
// parser knowing which one it is in.

export const EXIT_CODE = Object.freeze({ USAGE: 1, OK: 0 });

/** A CLI: report to stderr, then end the process. What commander 2.x hardcodes. */
export function cliPolicy({ write = (text) => process.stderr.write(text), exit = (code) => process.exit(code) } = {}) {
  return Object.freeze({
    name: "cli",
    mayWrite: true,
    mayExit: true,
    onError(message) {
      write(`error: ${message}\n`);
      exit(EXIT_CODE.USAGE);
    },
  });
}

/** A test or an embedded host: collect, never exit. */
export function collectingPolicy() {
  const written = [];
  return Object.freeze({
    name: "collecting",
    mayWrite: true,
    mayExit: false,
    written,
    onError(message) {
      written.push(message);
    },
  });
}

/** Silent: the caller intends to render the failure itself. */
export function silentPolicy() {
  return Object.freeze({
    name: "silent",
    mayWrite: false,
    mayExit: false,
    onError() {},
  });
}
