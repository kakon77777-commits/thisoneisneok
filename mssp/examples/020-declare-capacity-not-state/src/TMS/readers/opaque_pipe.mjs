// A reader over an unframed byte pipe. It takes whatever arrived and hands it
// over. It cannot tell a clean end from a connection that closed early,
// because nothing in what it receives says which.
//
// It is the honest half of the control pair: it declares that it CANNOT
// discriminate, and the challenge confirms it. Its silence about completeness
// therefore means nothing, and the report has to say so rather than letting it
// sit in the same column as `framed`'s silence.
export const NAME = "opaque-pipe";
export const CAN_FAIL_WITH = ["unreadable-chunk"];
export const CLAIMS_CAN_DISCRIMINATE = false;
export const HOW = "nothing in an unframed pipe distinguishes a clean end from an early close";

export function read(stream) {
  const chunks = stream.split("|").filter(Boolean).filter((c) => c !== "<end>");
  return {
    records: chunks.map((id) => ({ from: NAME, id })),
    incomplete_because: null,
  };
}
