// Take the value and promise there is no error, at run time.
export const NAME = ".unwrap_or(0)";
export const BODY = "    println!(\"{}\", fallible().unwrap_or(0));";
export const CLAIMS_COMPILER_FORCES_HANDLING = false;
export const HOW = "the Err case is named, but by a method call rather than by the type checker";
