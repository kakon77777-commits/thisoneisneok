// SMS — the parse itself. Returns a result; performs no effect.
//
// This is the whole re-cut. commander 2.20.3 writes:
//
//     Command.prototype.unknownOption = function(flag) {
//       if (this._allowUnknownOption) return;
//       console.error("error: unknown option `%s'", flag);
//       process.exit(1);
//     };
//
// Three lines, of which two act on the host process. The caller cannot decline
// either one. Here the same knowledge — "this flag is unknown" — becomes a value
// the caller receives and decides about.

/** @typedef {{kind: "ok", options: object, args: string[]}} Ok */
/** @typedef {{kind: "error", code: string, detail: object}} Err */

export const ERROR = Object.freeze({
  UNKNOWN_OPTION: "unknown_option",
  MISSING_OPTION_ARGUMENT: "missing_option_argument",
  MISSING_ARGUMENT: "missing_argument",
});

/**
 * @param {{flags: string, takesValue: boolean, name: string}[]} spec
 * @param {string[]} argv
 * @param {{allowUnknown?: boolean, required?: string[]}} [config]
 * @returns {Ok | Err}
 */
export function parse(spec, argv, config = {}) {
  const byFlag = new Map();
  for (const option of spec) {
    for (const flag of option.flags.split(",").map((f) => f.trim())) byFlag.set(flag, option);
  }

  const options = {};
  const args = [];

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];

    if (!token.startsWith("-")) {
      args.push(token);
      continue;
    }

    const option = byFlag.get(token);
    if (!option) {
      if (config.allowUnknown) {
        args.push(token);
        continue;
      }
      return { kind: "error", code: ERROR.UNKNOWN_OPTION, detail: { flag: token } };
    }

    if (!option.takesValue) {
      options[option.name] = true;
      continue;
    }

    const value = argv[i + 1];
    // An option that wants a value and is followed by another flag is missing
    // its argument — the same case commander reports then exits on.
    if (value === undefined || value.startsWith("-")) {
      return { kind: "error", code: ERROR.MISSING_OPTION_ARGUMENT, detail: { flags: option.flags, got: value ?? null } };
    }
    options[option.name] = value;
    i += 1;
  }

  for (const name of config.required ?? []) {
    if (!(name in options)) {
      return { kind: "error", code: ERROR.MISSING_ARGUMENT, detail: { name } };
    }
  }

  return { kind: "ok", options, args };
}
