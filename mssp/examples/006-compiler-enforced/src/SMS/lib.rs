//! Framing: a payload becomes a record with a length and a checksum.
//!
//! This is the capability the program is. Remove it and there is nothing left
//! to encode — which is the identity test, and here it is also a fact about the
//! build graph: every other crate can be deleted and this one still compiles.

/// A framed record: length prefix (2 bytes, big-endian), payload, checksum.
pub fn frame(payload: &[u8]) -> Result<Vec<u8>, FrameError> {
    if payload.len() > u16::MAX as usize {
        return Err(FrameError::TooLong(payload.len()));
    }
    let mut record = Vec::with_capacity(payload.len() + 3);
    record.extend_from_slice(&(payload.len() as u16).to_be_bytes());
    record.extend_from_slice(payload);
    record.push(checksum(payload));
    Ok(record)
}

/// Sum of bytes mod 256. Weak on purpose: the example is about structure, and a
/// real checksum here would invite the reader to think the framing is the point.
pub fn checksum(payload: &[u8]) -> u8 {
    payload.iter().fold(0u8, |acc, b| acc.wrapping_add(*b))
}

/// Split a record back into its parts, so a caller can check a claim rather
/// than take one. `frame` returning something is not evidence it framed.
pub fn unframe(record: &[u8]) -> Result<&[u8], FrameError> {
    if record.len() < 3 {
        return Err(FrameError::Truncated(record.len()));
    }
    let declared = u16::from_be_bytes([record[0], record[1]]) as usize;
    let payload = &record[2..record.len() - 1];
    if payload.len() != declared {
        return Err(FrameError::LengthMismatch {
            declared,
            actual: payload.len(),
        });
    }
    let found = record[record.len() - 1];
    let expected = checksum(payload);
    if found != expected {
        return Err(FrameError::ChecksumMismatch { expected, found });
    }
    Ok(payload)
}

#[derive(Debug, PartialEq)]
pub enum FrameError {
    TooLong(usize),
    Truncated(usize),
    LengthMismatch { declared: usize, actual: usize },
    ChecksumMismatch { expected: u8, found: u8 },
}

impl std::fmt::Display for FrameError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::TooLong(n) => write!(f, "payload is {n} bytes, the length prefix holds 65535"),
            Self::Truncated(n) => write!(f, "record is {n} bytes, too short to hold a frame"),
            Self::LengthMismatch { declared, actual } => {
                write!(f, "frame declares {declared} bytes, carries {actual}")
            }
            Self::ChecksumMismatch { expected, found } => {
                write!(f, "checksum is {found:#04x}, payload computes {expected:#04x}")
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn round_trips() {
        let record = frame(b"hello").unwrap();
        assert_eq!(unframe(&record).unwrap(), b"hello");
    }

    #[test]
    fn a_flipped_byte_is_reported_not_absorbed() {
        let mut record = frame(b"hello").unwrap();
        record[3] ^= 0xff;
        assert!(matches!(
            unframe(&record),
            Err(FrameError::ChecksumMismatch { .. })
        ));
    }
}
