// Where configuration happens, and what it reports.
//
// This is the leak, repaired. Upstream:
//
//     logging.info("hello")          # root has no handlers -> calls basicConfig()
//     logging.basicConfig(format=…)  # root now HAS handlers -> returns, does nothing
//
// Measured on 3.14.5: root.handlers goes 0 -> 1 on the first convenience call,
// and the later basicConfig leaves the formatter object identical. No error, no
// warning, no return value. The requested format is discarded in silence.
//
// The structural cause is not the guard clause. It is that the convenience
// functions reach across all four axes — they decide threshold, sink, format
// and destination at once, on a global, as a side effect of logging one line.
//
// So here: configuring is a permission, it is explicit, and it says what it did.

import { assertMayConfigure } from "../SCL/policy.js";

export function makeRegistry() {
  let config = null;
  let installedBy = null;

  return {
    /** Install the sink set. Reports the outcome instead of returning nothing. */
    configure(capability, next) {
      assertMayConfigure(capability);
      if (config) {
        // Upstream's silent early return, made audible. Refusing and reporting
        // are different from doing nothing and reporting nothing.
        return {
          applied: false,
          why: `already configured by ${installedBy}; pass replace: true to override`,
          installedBy,
        };
      }
      config = next;
      installedBy = capability;
      return { applied: true, why: "", installedBy: capability };
    },

    replace(capability, next) {
      assertMayConfigure(capability);
      const previous = installedBy;
      config = next;
      installedBy = capability;
      return { applied: true, why: previous ? `replaced configuration from ${previous}` : "", installedBy: capability };
    },

    current() {
      return config;
    },

    /** Whether logging would go anywhere at all. The question upstream cannot be asked. */
    status() {
      if (!config) return { configured: false, why: "nothing has configured logging" };
      if (!config.sinks?.length) return { configured: true, reachable: false, why: "configured with no sink" };
      return { configured: true, reachable: true, sinks: config.sinks.map((s) => s.name), installedBy };
    },
  };
}
