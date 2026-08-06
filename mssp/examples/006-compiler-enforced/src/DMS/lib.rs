//! What actually happened, including what did not.

pub struct Run {
    pub payload_bytes: usize,
    pub record_bytes: usize,
    pub encoding: String,
    pub encoded_chars: usize,
    /// Compiled in, permitted, and never called on this run. Loaded-and-correct
    /// and never-exercised are different states, and a report that cannot tell
    /// them apart is the one 改良點 7 exists to forbid.
    pub compiled_but_unused: Vec<String>,
    /// Permitted by policy with no crate behind it. Not an error: policy is
    /// allowed to describe a deployment that has not been built yet.
    pub permitted_without_a_crate: Vec<String>,
    /// Compiled in and refused by policy.
    pub compiled_but_refused: Vec<String>,
    pub verified: Result<(), String>,
}

pub fn render(run: &Run) -> String {
    let mut out = String::new();
    out.push_str("\n== record\n");
    out.push_str(&format!("  payload            {} bytes\n", run.payload_bytes));
    out.push_str(&format!(
        "  framed             {} bytes  (+{} for length and checksum)\n",
        run.record_bytes,
        run.record_bytes - run.payload_bytes
    ));
    out.push_str(&format!(
        "  {:<18} {} chars  ({:.2}x the record)\n",
        run.encoding,
        run.encoded_chars,
        run.encoded_chars as f64 / run.record_bytes as f64
    ));

    out.push_str("\n  round trip         ");
    match &run.verified {
        Ok(()) => out.push_str("unframed back to the original payload\n"),
        Err(why) => out.push_str(&format!("FAILED — {why}\n")),
    }

    out.push_str("\n== what this run does not say\n");
    section(&mut out, "compiled in, permitted, never called", &run.compiled_but_unused);
    section(&mut out, "permitted, no crate behind it", &run.permitted_without_a_crate);
    section(&mut out, "compiled in, refused by policy", &run.compiled_but_refused);
    out
}

fn section(out: &mut String, label: &str, items: &[String]) {
    if items.is_empty() {
        out.push_str(&format!("  {label:<38} none\n"));
        return;
    }
    out.push_str(&format!("  {label:<38} {}\n", items.join(", ")));
}
