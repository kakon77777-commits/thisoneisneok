// A reader over a framed stream. The frame carries a terminator, so this
// reader can tell a truncated stream from a complete one.
//
// What it declares is NOT that it is complete — that remains forbidden by
// 改良點 15. It declares what it is CAPABLE of observing, and that claim is
// answerable by challenge: hand it a case whose answer is already known.
export const NAME = "framed";
export const CAN_FAIL_WITH = ["unreadable-chunk"];
export const CLAIMS_CAN_DISCRIMINATE = true;
export const HOW = "the frame ends with a terminator record, so its absence is observable";

const TERMINATOR = "<end>";

export function read(stream) {
  const chunks = stream.split("|").filter(Boolean);
  const terminated = chunks.at(-1) === TERMINATOR;
  const records = chunks.filter((c) => c !== TERMINATOR).map((id) => ({ from: NAME, id }));
  return {
    records,
    // The only assertion it is allowed to make: the negative one.
    incomplete_because: terminated ? null : "no terminator record",
  };
}
