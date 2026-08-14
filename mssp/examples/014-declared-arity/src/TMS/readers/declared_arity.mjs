// Read against what the field was declared to hold.
//
// The only reader here that can come back empty-handed. A field declared `one`
// holding three values is not a value to be picked from — it is a disagreement
// between the request and the contract, and picking silently is what makes it
// invisible.
export const READER = "declared-arity";
export const ON_MULTIPLICITY = "refuses when the count disagrees with the declaration";
export const REFUSES = true;

export function read(values, arity) {
  if (arity === "many") return { value: values, refused: false };
  if (arity === "optional-one" && values.length === 0) return { value: null, refused: false };
  if (values.length === 1) return { value: values[0], refused: false };
  return {
    value: null,
    refused: true,
    because: `declared ${arity}, received ${values.length}`,
  };
}
