// It declares that it can discriminate. It reads exactly like the opaque pipe.
//
// This unit is in the tree deliberately: 改良點 18 is worth nothing unless a
// false capacity claim is caught, and it has to be caught by RUNNING the unit,
// not by reading the constant above.
export const NAME = "claims-framing";
export const CAN_FAIL_WITH = ["unreadable-chunk"];
export const CLAIMS_CAN_DISCRIMINATE = true;
export const HOW = "it says the frame is checked; the challenge disagrees";

export function read(stream) {
  const chunks = stream.split("|").filter(Boolean).filter((c) => c !== "<end>");
  return {
    records: chunks.map((id) => ({ from: NAME, id })),
    incomplete_because: null,
  };
}
