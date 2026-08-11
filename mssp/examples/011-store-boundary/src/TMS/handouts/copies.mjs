// Deserialise on every read. What the caller gets is theirs.
//
// Moved here from SMS on 2026-08-11, the day it shipped, after the Board host
// asked whether this belonged in FMS at all. The island test answers: it is a
// file that imports nothing and can be run alone, which is what a TMS unit is.
// Leaving it in SMS would have meant a third strategy is an edit to SMS - the
// accretion 缺點 2 names as the method's most likely way to fail.
export const NAME = "copies";
export const HANDS_BACK = "a fresh object on every read";
export const MUTATION_SURVIVES = false;

export function make(deserialise) {
  return {
    remember() {},
    answer: (serialised) => deserialise(serialised),
  };
}
