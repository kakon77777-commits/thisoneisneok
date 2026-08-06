//! What this deployment permits. Names, never crates.

use std::path::PathBuf;

pub struct Policy {
    pub permitted: Vec<String>,
    pub max_payload_bytes: usize,
}

pub fn load() -> Policy {
    // CARGO_MANIFEST_DIR is a compile-time constant, but the read happens at
    // run time. include_str! would have compiled the policy into the binary and
    // made every policy change a rebuild.
    let path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("policy.json");
    let text = std::fs::read_to_string(&path)
        .unwrap_or_else(|e| panic!("SCL cannot read {}: {e}", path.display()));
    Policy {
        permitted: string_list(&text, "permitted"),
        max_payload_bytes: number(&text, "max_payload_bytes").unwrap_or(0),
    }
}

impl Policy {
    pub fn permits(&self, encoding: &str) -> bool {
        self.permitted.iter().any(|p| p == encoding)
    }
}

/// Enough JSON for one array of strings. A dependency-free example pays for its
/// dependency-freedom somewhere, and this is where.
fn string_list(text: &str, key: &str) -> Vec<String> {
    let anchor = format!("\"{key}\"");
    let Some(start) = text.find(&anchor).and_then(|i| text[i..].find('[').map(|j| i + j + 1)) else {
        return Vec::new();
    };
    let Some(end) = text[start..].find(']').map(|j| start + j) else {
        return Vec::new();
    };
    text[start..end]
        .split(',')
        .map(|item| item.trim().trim_matches('"').to_string())
        .filter(|item| !item.is_empty())
        .collect()
}

fn number(text: &str, key: &str) -> Option<usize> {
    let anchor = format!("\"{key}\"");
    let start = text.find(&anchor)? + anchor.len();
    let rest = text[start..].trim_start().strip_prefix(':')?.trim_start();
    let digits: String = rest.chars().take_while(char::is_ascii_digit).collect();
    digits.parse().ok()
}

#[cfg(test)]
mod tests {
    #[test]
    fn reads_the_file_not_a_constant() {
        let policy = super::load();
        assert!(policy.permits("encodings/hex"));
        assert!(!policy.permits("encodings/esc"));
        assert_eq!(policy.max_payload_bytes, 64);
    }
}
