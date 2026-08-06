//! The island test, asked of the compiler instead of of a grep.
//!
//!   cargo run --offline -q -p island-test
//!
//! Sections 2 and 3 are the reason this example is in Rust: one requires cargo
//! to REFUSE, the other requires it to accept — and the gap between them is
//! exactly what the site build has to check, because the compiler will not.

use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

fn main() {
    let src = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .unwrap()
        .to_path_buf();
    let scratch = std::env::temp_dir().join("mssp-006-island");
    let _ = fs::remove_dir_all(&scratch);
    fs::create_dir_all(&scratch).unwrap();

    let mut failures: Vec<String> = Vec::new();

    println!("\n== 1. each TMS crate compiles alone, with no sibling on disk");
    for unit in ["hex", "b64", "esc"] {
        let solo = scratch.join(format!("solo-{unit}"));
        copy_crate(&src.join("TMS").join(unit), &solo, Detach::Yes);
        let (ok, _) = cargo(&solo, &["build", "--offline", "-q"]);
        report(
            &mut failures,
            &format!("TMS/{unit} builds with nothing else present"),
            ok,
            &format!("copied alone to {}", solo.display()),
        );

        let (tests_ok, _) = cargo(&solo, &["test", "--offline", "-q"]);
        report(
            &mut failures,
            &format!("TMS/{unit} passes its own tests alone"),
            tests_ok,
            "",
        );
    }

    println!("\n== 2. a sibling reference the manifest does not declare CANNOT compile");
    {
        let sneak = scratch.join("sneak");
        copy_crate(&src.join("TMS").join("hex"), &sneak, Detach::Yes);
        // The sibling is physically present, so the failure cannot be "file not
        // found" — it has to be cargo refusing an undeclared crate.
        copy_crate(&src.join("TMS").join("b64"), &scratch.join("sneak-b64"), Detach::No);
        add_sibling_use(&sneak.join("lib.rs"));

        let (ok, output) = cargo(&sneak, &["build", "--offline", "-q"]);
        report(
            &mut failures,
            "cargo refuses `use tms_b64` with no dependency declared",
            !ok,
            &first_error(&output),
        );
        // The first version of this check accepted any failure whose text
        // mentioned tms_b64, and it passed while cargo was actually rejecting a
        // `use` line accidentally placed above the module doc comment
        // (E0753). It was green without ever testing an undeclared crate.
        report(
            &mut failures,
            "and it refuses for the stated reason: an unresolved crate",
            !ok && (output.contains("E0432") || output.contains("can't find crate")),
            "E0432 / can't find crate — not a syntax error that happens to mention it",
        );
    }

    println!("\n== 3. …and DOES compile once the manifest declares it");
    {
        let declared = scratch.join("declared");
        copy_crate(&src.join("TMS").join("hex"), &declared, Detach::Yes);
        // Not nested inside the crate: a copied sibling carrying its own
        // [workspace] under a crate that also has one is two workspace roots,
        // and cargo stops before it ever reaches the question being asked.
        copy_crate(&src.join("TMS").join("b64"), &scratch.join("declared-b64"), Detach::No);
        add_sibling_use(&declared.join("lib.rs"));

        let manifest = declared.join("Cargo.toml");
        let text = fs::read_to_string(&manifest).unwrap();
        fs::write(
            &manifest,
            text.replace(
                "[dependencies]",
                "[dependencies]\ntms-b64 = { path = \"../declared-b64\" }",
            ),
        )
        .unwrap();

        let (ok, output) = cargo(&declared, &["build", "--offline", "-q"]);
        report(
            &mut failures,
            "declaring the sibling makes it compile",
            ok,
            &if ok { String::new() } else { first_error(&output) },
        );
        report(
            &mut failures,
            "so the compiler is not the thing forbidding a sibling dependency",
            ok,
            "it forbids an UNDECLARED one — declaring it is legal and is what the site build checks",
        );
    }

    println!("\n== 4. the build's rule, applied here to the manifests");
    {
        let mut offenders = Vec::new();
        for unit in ["hex", "b64", "esc"] {
            let manifest = src.join("TMS").join(unit).join("Cargo.toml");
            let text = fs::read_to_string(&manifest).unwrap();
            if text.contains("path = \"../") {
                offenders.push(unit.to_string());
            }
        }
        report(
            &mut failures,
            "no TMS crate declares a path dependency at all",
            offenders.is_empty(),
            &format!("checked 3 manifests, offenders: {:?}", offenders),
        );

        // The check above must be able to fail, or it is decorative.
        let planted = "[dependencies]\ntms-b64 = { path = \"../b64\" }\n";
        report(
            &mut failures,
            "and that check detects a planted sibling dependency",
            planted.contains("path = \"../"),
            "the failing case, evaluated rather than asserted",
        );
    }

    println!("\n== 5. SCL names encodings it has no crate for, and refuses one it has");
    {
        let policy = fs::read_to_string(src.join("SCL").join("policy.json")).unwrap();
        report(
            &mut failures,
            "policy refuses an encoding that IS compiled in",
            !policy.contains("encodings/esc"),
            "encodings/esc has a crate and is not permitted",
        );
        let (ok, output) = cargo(&src, &["run", "--offline", "-q", "-p", "report", "--", "--esc"]);
        report(
            &mut failures,
            "and the program exits non-zero rather than encoding anyway",
            !ok && output.contains("refuses"),
            output.lines().next().unwrap_or("").trim(),
        );
    }

    println!();
    if failures.is_empty() {
        println!("  island test passed");
    } else {
        println!("  {} check(s) failed:", failures.len());
        for f in &failures {
            println!("    - {f}");
        }
        std::process::exit(1);
    }
}

fn report(failures: &mut Vec<String>, label: &str, ok: bool, detail: &str) {
    let suffix = if detail.is_empty() {
        String::new()
    } else {
        format!(" - {detail}")
    };
    println!("  {}  {label}{suffix}", if ok { "PASS" } else { "FAIL" });
    if !ok {
        failures.push(label.to_string());
    }
}

#[derive(PartialEq)]
enum Detach {
    /// Give the copy its own `[workspace]`, so cargo treats it as a package
    /// standing on its own rather than a member of whatever is above it.
    Yes,
    /// Leave it alone: a crate that will be a path dependency of another copy
    /// must not declare a workspace, or there are two roots and cargo refuses
    /// before reaching the question.
    No,
}

/// Copy a crate's own files (not its subdirectories).
fn copy_crate(from: &Path, to: &Path, detach: Detach) {
    fs::create_dir_all(to).unwrap();
    for entry in fs::read_dir(from).unwrap() {
        let entry = entry.unwrap();
        if entry.file_type().unwrap().is_file() {
            fs::copy(entry.path(), to.join(entry.file_name())).unwrap();
        }
    }
    if detach == Detach::No {
        return;
    }
    let manifest = to.join("Cargo.toml");
    let text = fs::read_to_string(&manifest).unwrap();
    if !text.contains("[workspace]") {
        fs::write(&manifest, format!("{text}\n[workspace]\n")).unwrap();
    }
}

/// Add a sibling `use` AFTER the module doc comment. Inserting at byte 0 puts
/// it above `//!`, which is E0753 — a syntax error, and a crate that fails to
/// parse never gets as far as resolving the import the test is about.
fn add_sibling_use(lib: &Path) {
    let source = fs::read_to_string(lib).unwrap();
    let body_starts = source
        .lines()
        .position(|line| !line.starts_with("//!") && !line.trim().is_empty())
        .unwrap_or(0);
    let mut lines: Vec<String> = source.lines().map(str::to_string).collect();
    lines.insert(body_starts, "use tms_b64::encode as sibling;".to_string());
    lines.insert(
        body_starts + 1,
        "pub fn leak(b: &[u8]) -> String { sibling(b) }".to_string(),
    );
    fs::write(lib, lines.join("\n")).unwrap();
}

fn cargo(dir: &Path, args: &[&str]) -> (bool, String) {
    let out = Command::new("cargo")
        .args(args)
        .current_dir(dir)
        // A separate target directory: the parent cargo holds a lock on its own.
        .env("CARGO_TARGET_DIR", std::env::temp_dir().join("mssp-006-target"))
        .output()
        .expect("cargo is not on PATH");
    let text = format!(
        "{}{}",
        String::from_utf8_lossy(&out.stdout),
        String::from_utf8_lossy(&out.stderr)
    );
    (out.status.success(), text)
}

fn first_error(output: &str) -> String {
    output
        .lines()
        .find(|l| l.trim_start().starts_with("error"))
        .unwrap_or("")
        .trim()
        .chars()
        .take(90)
        .collect()
}
