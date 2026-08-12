// Read the record, change it, write it back.
//
// The shape everyone writes. It requires that nothing else writes between the
// read and the write, which is not a property any medium has - it is a property
// of a transaction. Declaring the requirement is what makes the mismatch
// visible before an interleaving does.
export const OPERATION = "read-modify-write";
export const REQUIRES = ["serialised-transaction"];

export function steps(medium, key, change) {
  let held = null;
  return [
    () => { held = JSON.parse(medium.read(key)); return { step: "read" }; },
    () => { held = change(held); return { step: "modify" }; },
    () => {
      for (const write of medium.writeSteps(key, JSON.stringify(held))) write();
      return { step: "write", retry: false };
    },
  ];
}
