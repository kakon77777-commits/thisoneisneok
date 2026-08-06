# 006 — Handing the rule to the compiler, and measuring how much of it the compiler took

## What this program does

It frames a payload — two-byte length, payload, checksum — and encodes the
record with whichever encoding this deployment permits.

```bash
cargo run --offline -q --manifest-path src/Cargo.toml -p report
cargo run --offline -q --manifest-path src/Cargo.toml -p report -- --b64 "hello"
cargo run --offline -q --manifest-path src/Cargo.toml -p island-test
```

Every set is a crate in one cargo workspace. Each TMS unit — `hex`, `b64`,
`esc` — is a crate with an empty `[dependencies]`.

```console
$ cargo run -q -p report

== record
  payload            20 bytes
  framed             23 bytes  (+3 for length and checksum)
  encodings/hex      46 chars  (2.00x the record)

  round trip         unframed back to the original payload

== what this run does not say
  compiled in, permitted, never called   encodings/b64
  permitted, no crate behind it          encodings/z85
  compiled in, refused by policy         encodings/esc
```

## The structural decision

**Hand the dependency rule to the compiler — then measure exactly how much of
it the compiler actually took.**

[開發區 缺點 1](/html/mssp/modules/development.html) says the dependency check
is text matching, so *a determined author can step around it*, and
[改良點 2](/html/mssp/modules/development.html) says to redo it in a language
with real module boundaries and compare the strength of the check against the
cost of writing it. This is that comparison, and the answer is a split rather
than a win.

### What the compiler took

**An undeclared sibling reference cannot exist.** `use tms_b64::encode;` inside
`TMS/hex` is `error[E0432]: unresolved import` unless `tms-b64` appears in
hex's `[dependencies]`. The island test measures this with the sibling crate
**physically present on disk**, so the failure cannot be "file not found."

That is a different kind of guarantee from the JavaScript and Python examples.
There, the rule is a grep, and a grep is only as good as its idea of what a
source file is — which is exactly how it came to not run on Python at all
([開發日誌 08-03](/html/mssp/modules/log.html)), and how it came to say nothing
about a `.rs` file this morning.

### What the compiler did not take

**Declaring the sibling is completely legal.** Add two lines to hex's
`Cargo.toml` and the same `use` compiles. Section 3 of the island test requires
this to succeed, because an example that only showed the refusal would be
claiming the compiler solved a problem it did not.

So the rule splits cleanly:

| | who enforces it |
|---|---|
| reaching a sibling **without declaring it** | cargo, absolutely |
| **declaring** a sibling dependency | still the site build |

The gain is not that the check disappeared. It is that **the check moved from
every source line to one file per unit, in a fixed format**. `scripts/build-mssp.mjs`
now reads each TMS crate's `Cargo.toml` rather than pattern-matching `use`
lines — and it reads the same manifest cargo reads, so there is no second
representation to drift.

That is the real answer to 改良點 2: a compiled language does not remove the
rule, it makes the rule **checkable in one authoritative place**.

### What it cost

Measured on this example:

```text
  .rs      667 lines   8 files   the program
  .toml    125 lines   9 files   1 workspace + 8 crate manifests
  .lock     44 lines   1 file    generated
  .json     43 lines   2 files   FMS manifest + SCL policy
  TOTAL    879 lines  20 files
```

**10–13 lines of manifest per unit, and one extra file per unit.** For three
encoders that is 33 lines to buy a guarantee the previous five examples could
only assert. Whether that trade holds at thirty units, I have not
measured — a thirty-crate workspace has its own costs (build graph, version
churn, IDE load) that three does not show.

One thing the language charged that the others did not: **SCL had to decide
when to read its policy.** `include_str!` would compile `policy.json` into the
binary and make every policy change a rebuild. `env!("CARGO_MANIFEST_DIR")` +
`std::fs::read_to_string` keeps it a runtime read. In JavaScript and Python
that decision does not exist, because reading a file at startup is the only
option there is.

## Set by set

**FMS** — `manifest.json`, and specifically the two lists named
*what_the_toolchain_enforces* and *what_the_toolchain_does_NOT_enforce*.

**SCL** — `policy.json`, read at run time. It permits `encodings/z85`, which
**no crate provides**, and refuses `encodings/esc`, which is compiled in. Both
are deliberate: policy names capabilities rather than holding them, the same
decision as the Route in [範例 004](/html/mssp/004-router.html).

**SMS** — `frame` / `unframe`. Remove it and there is nothing to encode.
`unframe` exists so `main` can verify the record instead of trusting that
`frame` returning `Ok` means it framed.

**TMS** — three crates, three empty `[dependencies]`.

**DMS** — reports what ran, and three distinct ways a capability can be absent:
compiled but never called, permitted with nothing behind it, compiled but
refused. [改良點 7](/html/mssp/modules/development.html)'s third minimum, with
the shape the compiler makes newly checkable.

## The island test

```console
$ cargo run -q -p island-test
  ... 16 checks across 5 sections ...
  island test passed
```

Section 1 copies each TMS crate **alone into an empty directory** and builds and
tests it there. Not "no sibling import was found" — no sibling exists on disk.

Sections 2 and 3 are why this example is in Rust:

```text
== 2. a sibling reference the manifest does not declare CANNOT compile
  PASS  cargo refuses `use tms_b64` with no dependency declared - error[E0432]: unresolved import `tms_b64`
  PASS  and it refuses for the stated reason: an unresolved crate

== 3. …and DOES compile once the manifest declares it
  PASS  declaring the sibling makes it compile
  PASS  so the compiler is not the thing forbidding a sibling dependency
```

### The check that passed for the wrong reason

Section 2 passed on its first run with this:

```text
error[E0753]: expected outer doc comment
```

The test inserts the sibling `use` into a copy of `lib.rs`, and the first
version inserted it at byte 0 — **above the `//!` module doc comment**, which is
a syntax error. The crate never got as far as resolving anything. The
accompanying assertion "it refuses for the right reason" passed too, because it
only required the output to mention `tms_b64`, and my own inserted line was
quoted in the error.

**A green check, testing nothing, in the section written to prove the compiler
enforces the rule.** The fix was to insert after the doc comment and to require
the specific diagnostic (`E0432` / `can't find crate`) rather than a substring.

Section 4 checks the half the compiler left behind — that no TMS manifest
declares a path dependency — and then evaluates the failing case, so the check
is not decorative.

## What this example does not solve

Following [改良點 8](/html/mssp/modules/development.html), each item says what
turning it into a measurement would take.

- **Three units is not thirty.** *(needs new code: a generator for an N-crate
  workspace and a build-time series.)* The 10–13 lines of manifest per unit is
  measured; the claim that it stays proportional is not. A thirty-crate
  workspace has costs — resolution time, lockfile churn, editor indexing — that
  three crates cannot show.

- **This example does not compare against the same program in JavaScript.**
  *(needs new code: a port, then the same measurement.)* [範例 005](/html/mssp/005-before-after.html)
  measured monolith against MSSP in one language. The comparison this one
  implies — the same MSSP structure in a checked language versus a grepped one
  — would need both, and I built one.

- **`unused_import` is a warning here, not an error.** *(one command: add
  `#![deny(unused_imports)]` and rebuild.)* By 改良點 8's own rule this is
  unfinished work rather than a limitation, and I am listing it as work: it is
  the closest thing Rust offers to
  [改良點 3](/html/mssp/modules/development.html)'s *loaded but never read*
  proxy, and I did not pursue it because the interesting version measures
  **runtime** unused capability, which `deny` cannot see.

- **A workspace is not the only Rust shape, and I did not compare shapes.**
  *(unmeasurable from one example.)* One crate with `pub(crate)` modules, or
  separate published crates, would each move the boundary somewhere else. Which
  shape MSSP should prefer in Rust is a question this example raises and does
  not answer.

- **Nothing here tests what happens when a unit legitimately needs a sibling.**
  *(needs new code, and first a criterion.)* The method says a TMS that needs a
  sibling is a sign the split is wrong — but "declare it and be caught by the
  build" and "the split is wrong" are different diagnoses, and the build cannot
  tell them apart. That is closer to a gap in the method than in the example.
