// Probes that run the real built-ins. Nothing here is simulated.
export const runtime = () => `${process.release?.name ?? "node"} ${process.version} (V8 ${process.versions.v8})`;

export const frozen = () => Object.freeze({ price: 100 });

// The control: the same shape, never frozen. It is what makes the returned
// value uninformative rather than merely wrong — both come back 999.
export const neverFrozen = () => ({ price: 100 });

export const nested = () => Object.freeze({ inner: { price: 100 } });

export function through(mode, target, key = "price", value = 999) {
  return { mode: mode.MODE, ...mode.assign(target, key, value) };
}

// Whether a mode reported the violation at all, measured rather than read off
// the unit's own declaration.
export function reportsViolations(mode) {
  return through(mode, frozen()).threw !== null;
}

// What Object.freeze was given the chance to say about violations: nothing.
// It takes one argument, the object, and there is no second one.
export const freezeArity = () => Object.freeze.length;
