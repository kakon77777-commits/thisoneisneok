# 010 — Evidence has to say which event it is about

> `candidate`. Nothing here is adopted method, and section 3b of the island test
> is evidence against the criterion this example set out to demonstrate.

## What this program does

It reviews five rounds of changes. A source file that drifted needs review
unless an exemption applies — and it asks the exemptions a second question:
**what is this evidence evidence of?**

```bash
python src/main.py             # the review under the guard SCL names
python src/main.py --strict    # exit 1 when a fatal code appears
python src/main.py --compare   # both guards over the same history
python src/island_test.py      # 21 checks across 6 sections
```

```console
$ python src/main.py

  r2  2026-08-04
    !!  core/parser.py           review  the evidence is about r1, this change is r2
            evidence   tests/test_parser.py changed  [about r1]

  r4  2026-08-08
    !!  core/emit.py             review  owner-waived expired 2026-07-01, this change is 2026-08-08
            evidence   emitter rewrite in flight  [about *]

  r5  2026-08-10
    ok  build/schema_pb2.py      exempt  generated-file, unconditional by declaration, build-team until 2026-12-01
```

## The structural decision

**Evidence names the event it is about, and the guard compares that name to the
event under judgement.**

Freshness is not age. `tests/test_parser.py changed` is true, it was observed
just now, and in round 4 it is about round 1.

## Where it came from

[`mssp-d-003`](/html/mssp/discussions/mssp-d-003.html), opened the morning of
2026-08-09 with this criterion:

> A check that can only read one value cannot prove anything that needs two
> values to distinguish.

The EML-P line broke it the same afternoon. Their semantic monitor drilled
correctly when it was built, and now reports `no drift` for a change that
rewrites an interpreter's assignment semantics. Nothing broke it — the exemption
"the tests changed too" reads test files the baseline has not seen, and
"not seen" is relative to a baseline nobody has accepted. The observation takes
several values. The value it takes belongs to a change three rounds back.

So the criterion needed a second axis: not only how many values, but **which
event each value is about.** This example is that amendment made executable.

## The island test — and the part of it I did not expect

Section 3a measures what I went in to show:

```text
        event-blind-v1   1 distinct: exempt
        event-scoped-v1  2 distinct: exempt, review
```

Then section 3b asks whether that `1` is a property of the guard or of the
history, by adding one file no exemption covers:

```text
  PASS  one unexempted file makes event-blind-v1 produce two verdicts - exempt, review
```

**event-blind-v1 is not stuck on one value. It discriminates perfectly well —
on whether evidence exists, which is a different event from the one being
judged.** The arity framing was the wrong diagnosis of my own three defects.

The same correction arrived independently from the archaeology filed today.
[CPython's timestamp `.pyc` validation](/html/mssp/archaeology/010-cpython-pyc-invalidation.html)
also takes two values over four edits that all changed the source — it is not a
constant either. Its eight bytes of evidence are about the file's metadata; the
hash-based mode's eight bytes are about the file's bytes. Same size of evidence,
different event.

Section 4 is what survives: hold the observation byte-for-byte identical and
move only which round it belongs to.

```text
  PASS  both runs observed the very same thing - 'tests/test_parser.py changed'
  PASS  and they disagree only about which event it was about - r2 vs r1
  PASS  event-scoped-v1 gives different verdicts - exempt vs review
  PASS  event-blind-v1 gives the same verdict to both - exempt and exempt
```

## An exemption is allowed to be unconditional. It is not allowed to be quiet about it.

`generated-file` returns `about: "*"` and can never refuse. That is correct: a
generated file is generated, and dating that fact would be pedantry. What it
pays instead is an owner and a sunset.

This is not a hedge I invented. The archaeology measured the same design
upstream on the same day: CPython's `UNCHECKED_HASH` `.pyc` mode never
revalidates anything, deliberately, and records that choice in two flag bits.

`owner-waived` is the same shape with its sunset in the past, and that is what
the sunset is for.

| an exemption that | is | caught by |
|---|---|---|
| cites evidence about this event | valid | — |
| cites evidence about an earlier event | `stale-evidence` | the `about` comparison |
| never refuses, by declaration, with an owner and a live sunset | valid | — |
| never refuses, and its sunset has passed | `expired-waiver` | the date comparison |
| never refuses, and nobody wrote down that it never refuses | `malformed-evidence` | fail closed |

## The sets

| set | what is in it |
|---|---|
| FMS | the guards and what each reads, the evidence contract, the declarations, the history |
| SCL | which guard runs here, and which codes are fatal |
| SMS | the two guard implementations, resolution by id, the review walk |
| TMS | one file per exemption rule — plain data in, evidence or nothing out, no imports |
| DMS | the verdicts, what each was based on, and what nothing here is watching |

## What this example does not solve

**Measurable, not measured.** How often exemption evidence goes stale in a real
repository, and what requiring `about` costs the people who write exemptions.

**Not measurable here at all.** Whether an exemption *should* be event-scoped.
`generated-file` is unconditional because of what a generated file is;
`owner-waived` is unconditional because a person decided. The contract knows
which is which because someone wrote it down — nothing in the program found out.

And the open one: whether any of this is a rule, or a mistake I happen to make
often. Section 3b is the strongest thing said against it so far, and it is in
the test rather than in a footnote because
[改良點 6](/html/mssp/modules/development.html) says a check has to be shown to
be able to fail.
