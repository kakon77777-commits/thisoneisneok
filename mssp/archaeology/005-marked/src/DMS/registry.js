// Where a renderer is installed, what installing one reports, and — the part
// that matters — under which of two rules.
//
// Measured on marked 15.0.12 (island test, section 4). Registering twice:
//
//   use({ walkTokens: … })  -> BOTH run, last-registered first
//   use({ hooks: … })       -> BOTH run
//   use({ renderer: … })    -> only the second runs; the first is unreachable
//
// One function, two opposite semantics, selected by which key of the options
// object you happened to pass — and use() returns the instance in every case,
// so the call site cannot tell which rule it just got.
//
// The identical-return-value half of that is the third instance this week:
// logging.basicConfig returns None whether it configured or silently declined,
// and urllib's add_handler returns None whether it bound five methods or zero.

export const ACCUMULATE = "accumulate";
export const OVERWRITE = "overwrite";

export function makeRegistry() {
  const installed = new Map();   // token type -> [{ by, fn }], most recent last

  return {
    /**
     * Install renderers for some token types under an explicit rule, and say
     * which rule was applied and what it did to whatever was already there.
     */
    use(by, renderers, mode = OVERWRITE) {
      if (mode !== ACCUMULATE && mode !== OVERWRITE) {
        throw new Error(`unknown mode ${mode}; the rule must be named, not inferred from a key`);
      }
      const added = [];
      const replaced = [];
      const stacked = [];
      for (const [type, fn] of Object.entries(renderers)) {
        const chain = installed.get(type) ?? [];
        if (chain.length === 0) added.push(type);
        else if (mode === OVERWRITE) replaced.push({ type, previousOwner: chain.at(-1).by });
        else stacked.push({ type, alsoRuns: chain.map((c) => c.by) });
        installed.set(type, mode === OVERWRITE ? [{ by, fn }] : [...chain, { by, fn }]);
      }
      return { by, mode, added, replaced, stacked, handles: [...installed.keys()] };
    },

    /** The question marked cannot be asked: what is installed, and by whom. */
    manifest() {
      return [...installed.entries()].map(([type, chain]) => ({
        type,
        by: chain.at(-1).by,
        alsoRuns: chain.slice(0, -1).map((c) => c.by),
      }));
    },

    renderer() {
      return Object.fromEntries([...installed.entries()].map(([type, chain]) => [type, chain.at(-1).fn]));
    },
  };
}
