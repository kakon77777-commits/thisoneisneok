# 020 — Declare what you can observe, not what you are

> `candidate`. The twentieth entry, and the last of the archaeology run. It
> answers the question the Board host asked on 2026-08-19, which was the one
> thing 改良點 13–17 left standing.

## What this program does

Three readers meet one stream. What each declares is **not its state** but what
it is *able to see* — and that claim is answered by a challenge.

```bash
node src/main.mjs              # the run under the policy SCL names
node src/main.mjs --challenge  # just the challenge table
node src/main.mjs --strict     # exit 1 when a reader failed its challenge
node src/island_test.mjs       # 40 checks across 7 sections, and it prints the count itself
```

```console
  the challenge - two streams whose answers the harness already knows:
    reader           claims   complete->silent   truncated->spoke   verdict
    claims-framing   true     true               false              failed
    framed           true     true               true               passed
    opaque-pipe      false    true               false              failed

    claims-framing: REFUSED: capacity claimed and not demonstrated
    framed: capacity claimed and demonstrated
    opaque-pipe: capacity disclaimed, and the challenge agrees

  reader           records   completeness
  ~~ framed          3         no - declared (no terminator record)
  ?? opaque-pipe     3         not known otherwise, and this reader CANNOT tell
```

## The structural decision

[改良點 15](/html/mssp/modules/development.html) forbids a unit from declaring
itself complete, because nothing outside can check that. The Board host put the
question that leaves open:

> How does the report tell *"this reader has an internal cursor check and saw no
> further pages"* from *"this reader is an opaque pipe that swallowed whatever
> bytes arrived"*, without re-introducing a forbidden positive assertion?

Both are silent. [Example 017](/html/mssp/017-finished-is-not-complete.html) put
them in the same column, and warned that if most real readers land there, `not
known to be otherwise` quietly becomes "complete" in the reader's head — the
very trust the rule exists to remove.

**The move is to change what is declared.** Not the state — the **capacity**:

> **A unit declares what it is able to observe. That claim is not about the
> outcome, and unlike an outcome claim it can be tested — the harness hands it a
> case whose answer it already knows.**

Silence then splits in two, and no positive assertion is added:

| value | meaning |
|---|---|
| `no - declared` | the reader said so |
| `not known otherwise, and this reader can tell` | silent, **and it demonstrated the capacity to speak** |
| `not known otherwise, and this reader CANNOT tell` | silent, **and it could not have spoken** |

There is still no `complete`.

## The island test — the challenge needs both arms, or a constant passes it

**A reader that always answers "truncated" is right about the truncated
stream.** A one-armed challenge passes it. So `passed` is the conjunction, and
the island test drills **both** constants:

```text
  PASS  a reader that always says truncated IS right about the truncated stream
  PASS  and wrong about the complete one
  PASS  so a one-armed challenge would have passed it
  PASS  and the two-armed one does not
  PASS  the mirror image fails too
```

**Refusal keys on the claim, not the outcome.** `opaque-pipe` fails the
challenge and is *accepted* — it never claimed to pass. `claims-framing` fails
identically and is refused. Section 4 asserts that the two have the same
`passed` and opposite acceptance.

## The control pair — two silences that must not share a column

On the **complete** stream `framed` is silent, exactly as `opaque-pipe` is
silent on the truncated one. Silence alone therefore separates nothing, and only
the completeness column does. Without the pair, the third value would be a
relabelling rather than a distinction.

Five mutations were run and each turns the suite red, including one aimed
precisely at the one-armed challenge.

## Upstream, the same day

[Archaeology 020](/html/mssp/archaeology/020-rust-must-use.html) is this
argument made structural, and it is the last entry of the run:

```text
    route                compiles   must_use warning   error
    bare call            yes        yes                -
    let _ = ...          yes        -                  -
    let v: i32 = ...     NO         -                  E0308
    match { Ok, Err }    yes        -                  -
```

`Result<T, E>` is a declared capacity to be wrong, and **extraction is forced**:
using the `T` without naming the `Err` case is a type error, no lint needed.
**Discarding is not forced** — `let _ = ...` compiles clean even under
`#![deny(unused_must_use)]`, the loudest setting the language offers. The
strength of what remains is the *consumer's* setting, which is
[改良點 16](/html/mssp/modules/development.html) appearing inside a type system.

## What this example does not solve

**A demonstrated capacity is not a proved one.** Passing on this pair of streams
says nothing about every shape a reader may meet. Section 7 states that as a
check rather than a sentence.

**A disclaimer is believed.** A reader that says it *cannot* discriminate is
trusted, and one that disclaims falsely is treated as blind. That is the
conservative direction and the same unverified trade as 改良點 15 — named, not
closed.

**The challenge only reaches what the harness can construct.** A reader whose
framing is real but whose inputs cannot be synthesised gets no challenge at all;
SCL names that gap rather than implying coverage.
