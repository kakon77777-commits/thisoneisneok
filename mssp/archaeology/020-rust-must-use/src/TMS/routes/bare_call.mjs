// Call it and let the Result fall on the floor.
export const NAME = "bare call";
export const BODY = "    fallible();";
export const CLAIMS_COMPILER_FORCES_HANDLING = false;
export const HOW = "the value is dropped; #[must_use] makes it noisy, not impossible";
