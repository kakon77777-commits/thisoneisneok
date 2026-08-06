//! Lowercase hex. Two characters per byte, no padding rules, no state.

pub const NAME: &str = "encodings/hex";

pub fn encode(bytes: &[u8]) -> String {
    let mut out = String::with_capacity(bytes.len() * 2);
    for byte in bytes {
        out.push(nibble(byte >> 4));
        out.push(nibble(byte & 0x0f));
    }
    out
}

fn nibble(value: u8) -> char {
    match value {
        0..=9 => (b'0' + value) as char,
        _ => (b'a' + value - 10) as char,
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn encodes_without_a_sibling_loaded() {
        assert_eq!(super::encode(&[0x00, 0x0f, 0xff]), "000fff");
    }
}
