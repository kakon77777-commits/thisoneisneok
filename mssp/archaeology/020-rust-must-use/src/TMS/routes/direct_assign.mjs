// Try to use the T without acknowledging the E at all.
export const NAME = "let v: i32 = ...";
export const BODY = "    let v: i32 = fallible();\n    println!(\"{}\", v);";
export const CLAIMS_COMPILER_FORCES_HANDLING = true;
export const HOW = "Result<i32, String> is not i32, so extraction cannot be written without saying something about Err";
