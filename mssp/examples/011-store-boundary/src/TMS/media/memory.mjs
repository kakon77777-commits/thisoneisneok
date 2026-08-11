// A medium that keeps records in this process and nowhere else.
//
// It is here so the store can be tested without a filesystem, and so that
// section 4 of the island test has something whose persistence claim is
// FALSE - a control. A test that only ever runs against a medium that really
// persists cannot tell "written" from "still in memory".
export const MEDIUM = "memory";
export const PERSISTS_ACROSS_PROCESSES = false;

export function make() {
  const cells = new Map();
  return {
    read: (key) => (cells.has(key) ? cells.get(key) : null),
    write: (key, serialised) => { cells.set(key, serialised); },
    keys: () => [...cells.keys()].sort(),
  };
}
