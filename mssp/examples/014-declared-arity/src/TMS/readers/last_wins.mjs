// Return the last value and say nothing about the rest.
//
// This is what Object.fromEntries(params) does, and it is the other most
// reached-for shape. It disagrees with first-wins about WHICH value is "the"
// value, and neither of them mentions that there was a choice.
export const READER = "last-wins";
export const ON_MULTIPLICITY = "returns the last, discards the rest, reports nothing";
export const REFUSES = false;

export function read(values) {
  return { value: values.length ? values[values.length - 1] : null, refused: false };
}
