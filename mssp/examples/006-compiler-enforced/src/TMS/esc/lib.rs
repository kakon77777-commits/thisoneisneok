//! Printable bytes pass through; everything else becomes =XX.
//!
//! Included because it is the encoder whose output length depends on the
//! payload, so DMS has something to report that is not arithmetic.

pub const NAME: &str = "encodings/esc";

pub fn encode(bytes: &[u8]) -> String {
    let mut out = String::new();
    for &byte in bytes {
        if (0x20..0x7f).contains(&byte) && byte != b'=' {
            out.push(byte as char);
        } else {
            out.push('=');
            out.push(upper_nibble(byte >> 4));
            out.push(upper_nibble(byte & 0x0f));
        }
    }
    out
}

fn upper_nibble(value: u8) -> char {
    match value {
        0..=9 => (b'0' + value) as char,
        _ => (b'A' + value - 10) as char,
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn encodes_without_a_sibling_loaded() {
        assert_eq!(super::encode(b"ok"), "ok");
        assert_eq!(super::encode(&[0x0a]), "=0A");
        assert_eq!(super::encode(b"="), "=3D");
    }
}
