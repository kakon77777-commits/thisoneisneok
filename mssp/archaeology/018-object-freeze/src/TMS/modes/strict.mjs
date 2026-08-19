// Strict mode, which is what a module body already is.
//
// The same line of source as the sloppy unit runs here and raises instead.
export const MODE = "strict";
export const REPORTS_VIOLATIONS = true;
export const HOW_IT_IS_ENTERED = "a module, a class body, or an explicit directive";

export function assign(target, key, value) {
  try {
    const returned = (target[key] = value);
    return { returned, threw: null, actual: target[key] };
  } catch (raised) {
    return { returned: null, threw: `${raised.constructor.name}: ${raised.message}`, actual: target[key] };
  }
}
