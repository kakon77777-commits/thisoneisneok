// Sloppy mode, reached the way real code reaches it: a Function constructor.
//
// It imports nothing. It declares that it does NOT report violations, and the
// declaration is verified by running it (island test section 3b).
export const MODE = "sloppy";
export const REPORTS_VIOLATIONS = false;
export const HOW_IT_IS_ENTERED = "a Function constructor, an eval, or a classic script";

// eslint-disable-next-line no-new-func
const write = new Function("target", "key", "value",
  "const returned = (target[key] = value); return { returned, threw: null };");

export function assign(target, key, value) {
  return { ...write(target, key, value), actual: target[key] };
}
