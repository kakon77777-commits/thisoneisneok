// Return the first value and say nothing about the rest.
//
// This is URLSearchParams.get, and it is the most reached-for accessor in every
// web request path there is. It is not wrong; it answers a question. The
// question it answers is "what is the first value", and callers read it as
// "what is the value".
export const READER = "first-wins";
export const ON_MULTIPLICITY = "returns the first, discards the rest, reports nothing";
export const REFUSES = false;

export function read(values) {
  return { value: values.length ? values[0] : null, refused: false };
}
