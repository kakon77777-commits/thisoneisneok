// Read, change, and write back only if nothing moved underneath.
//
// It needs one thing from the medium - that a replace is a single step - and
// nothing from a transaction. That is the whole difference: the requirement
// shrank to something a medium can actually provide.
//
// What it does NOT do is make the second writer's increment happen. It refuses,
// and a refusal is only worth something if somebody retries. The final value
// under one interleaving is the same as read-modify-write's; what differs is
// that here someone was told.
export const OPERATION = "compare-and-set";
export const REQUIRES = ["atomic-replace"];

export function steps(medium, key, change) {
  let seen = null;
  let next = null;
  return [
    () => { seen = medium.read(key); return { step: "read" }; },
    () => { next = JSON.stringify(change(JSON.parse(seen))); return { step: "modify" }; },
    () => {
      // The comparison and the write are one step, which is what atomic-replace
      // buys. If the medium moved, this attempt is abandoned and reported.
      if (medium.read(key) !== seen) return { step: "compare+write", retry: true };
      for (const write of medium.writeSteps(key, next)) write();
      return { step: "compare+write", retry: false };
    },
  ];
}
