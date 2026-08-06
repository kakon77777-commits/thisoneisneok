//! Frame a payload and encode it with whichever encoding policy permits.
//!
//!   cargo run --offline -q -p report -- [--b64 | --hex | --esc] [text]

fn main() {
    let args: Vec<String> = std::env::args().skip(1).collect();
    let policy = scl::load();

    // Every encoder compiled into this binary, as (name, function). This list
    // is the one place the entry point knows more than one encoder exists.
    let compiled: Vec<(&str, fn(&[u8]) -> String)> = vec![
        (tms_hex::NAME, tms_hex::encode),
        (tms_b64::NAME, tms_b64::encode),
        (tms_esc::NAME, tms_esc::encode),
    ];

    // Which one to run comes from the flag if there is one, otherwise from the
    // first encoding policy permits that is also compiled in. No branch per
    // encoder — that is the seam example 005 caught me leaving in.
    let asked = args
        .iter()
        .find(|a| a.starts_with("--"))
        .map(|a| format!("encodings/{}", &a[2..]));
    let chosen = match asked {
        Some(name) => name,
        None => compiled
            .iter()
            .map(|(name, _)| name.to_string())
            .find(|name| policy.permits(name))
            .unwrap_or_else(|| "encodings/hex".to_string()),
    };

    if !policy.permits(&chosen) {
        eprintln!("SCL refuses {chosen}: this deployment permits {:?}", policy.permitted);
        std::process::exit(2);
    }
    let Some((_, encode)) = compiled.iter().find(|(name, _)| *name == chosen) else {
        eprintln!("{chosen} is permitted by policy but no crate provides it");
        std::process::exit(3);
    };

    let payload: Vec<u8> = args
        .iter()
        .find(|a| !a.starts_with("--"))
        .map(|s| s.as_bytes().to_vec())
        .unwrap_or_else(|| b"the quick brown fox\n".to_vec());

    if payload.len() > policy.max_payload_bytes {
        eprintln!(
            "SCL refuses a {}-byte payload: this deployment caps it at {}",
            payload.len(),
            policy.max_payload_bytes
        );
        std::process::exit(2);
    }

    let record = match sms::frame(&payload) {
        Ok(record) => record,
        Err(why) => {
            eprintln!("framing failed: {why}");
            std::process::exit(1);
        }
    };
    let encoded = encode(&record);

    let run = dms::Run {
        payload_bytes: payload.len(),
        record_bytes: record.len(),
        encoding: chosen.clone(),
        encoded_chars: encoded.chars().count(),
        compiled_but_unused: compiled
            .iter()
            .map(|(name, _)| name.to_string())
            .filter(|name| *name != chosen && policy.permits(name))
            .collect(),
        permitted_without_a_crate: policy
            .permitted
            .iter()
            .filter(|name| !compiled.iter().any(|(c, _)| c == *name))
            .cloned()
            .collect(),
        compiled_but_refused: compiled
            .iter()
            .map(|(name, _)| name.to_string())
            .filter(|name| !policy.permits(name))
            .collect(),
        // Verified by taking the record apart again, not by trusting that
        // frame() returning Ok means it framed.
        verified: match sms::unframe(&record) {
            Ok(back) if back == payload.as_slice() => Ok(()),
            Ok(_) => Err("unframed to different bytes".to_string()),
            Err(why) => Err(why.to_string()),
        },
    };

    print!("{}", dms::render(&run));
    println!("\n  {encoded}");
}
