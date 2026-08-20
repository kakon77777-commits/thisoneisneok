// The control. It names the Err arm and compiles clean with no warning.
//
// Without it, "let _ = ... compiles clean" would not be evidence of anything:
// it would be consistent with every route compiling clean.
export const NAME = "match { Ok, Err }";
export const BODY = "    let v = match fallible() { Ok(x) => x, Err(_) => 0 };\n    println!(\"{}\", v);";
export const CLAIMS_COMPILER_FORCES_HANDLING = false;
export const HOW = "the control - handling is written out, so nothing needs to be forced";
