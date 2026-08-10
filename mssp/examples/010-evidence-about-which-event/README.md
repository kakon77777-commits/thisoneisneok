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
python src/island_test.py      # 26 checks across 7 sections
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

**Evidence names what it is evidence of, and the guard compares that against
what is being judged.** That turned out to be two questions, not one:

| axis | the question | the field |
|---|---|---|
| **when** | which event is this about? | `about` |
| **what** | which thing is this about? | `subject` |

Freshness is not age: `tests/test_parser.py changed` is true, it was observed
just now, and in round 4 it is about round 1. And relevance is not freshness:
the same observation, in the right round, can be about a different file.

A guard can bind either axis without the other, **and both failures look
exactly like a pass.** This example shipped in the morning binding only the
first one — see below.

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
| cites evidence about this event and this subject | valid | — |
| cites evidence about an earlier event | `stale-evidence` | the `about` comparison |
| cites evidence about a different subject | `wrong-subject` | the `subject` comparison |
| never refuses, by declaration, with an owner and a live sunset | valid | — |
| never refuses, and its sunset has passed | `expired-waiver` | the date comparison |
| never refuses, and nobody wrote down that it never refuses | `malformed-evidence` | fail closed |

Note what "unconditional" turned out to mean: `generated-file` is unconditional
**in time** and still bound **in subject**. A waiver for `core/emit.py` does not
waive `core/parser.py`, and the version published this morning could not tell
the difference.

## The second axis, found by someone else, hours after this shipped

Metron probed the SSD governance runtime by attaching one piece of evidence —
content "A exists" — to entity A, entity B, and the relation B→A **inside the
same snapshot**. `validate()` accepted all three.

They then made a distinction I had not: their runtime binds evidence to its
snapshot and projection, so it refuses evidence from **another time**. It has
nothing that refuses evidence about **another subject**. They declined to call
that an implementation of 改良點 10, and they were right to.

Pointing the same probe at this example:

```text
        judging  core/parser.py in r3
        evidence tests/test_lexer.py changed  [about r3, subject core/lexer.py]
        event-blind-v1               exempt
        event-scoped-v1              exempt
        event-and-subject-scoped-v1  review
```

**`event-scoped-v1` accepts it, and could not have done otherwise: it never
reads `change["path"]`.** Nothing is stale — `r3` is exactly the round under
judgement and the observation is true.

`event-and-subject-scoped-v1` is composed on top rather than replacing it,
because the older guard is now the artifact that reproduces the finding, and
deleting it would delete the evidence.

Two honest qualifiers, both of which Metron applied to their own probe first:

- **This is a constructed acceptance gap, not an observed incident.** Over the
  published history the last two guards never disagree, because `look()` derives
  evidence from the change's own path — the binding is a property of how the
  exemptions are *called*, not of anything the guard checked.
- The new section drills both ways: the guard must also **accept** once the
  subject matches, or it would only prove that a stricter guard refuses more.

## The sets

| set | what is in it |
|---|---|
| FMS | the guards and what each reads, the evidence contract and its two axes, the declarations, the history |
| SCL | which guard runs here (now the subject-scoped one), and which codes are fatal |
| SMS | the three guard implementations, resolution by id, the review walk |
| TMS | one file per exemption rule — plain data in, evidence or nothing out, no imports |
| DMS | the verdicts, what each was based on, and what nothing here is watching |

## What this example does not solve

**Measurable, not measured.** How often exemption evidence goes stale in a real
repository, and what requiring `about` costs the people who write exemptions.

**Not measurable here at all.** Whether an exemption *should* be event-scoped.
`generated-file` is unconditional because of what a generated file is;
`owner-waived` is unconditional because a person decided. The contract knows
which is which because someone wrote it down — nothing in the program found out.

**And a third axis may exist.** `about` and `subject` were both found by being
caught out, hours apart, on the same day. There is no argument here that two is
the number — only that one was demonstrably too few, twice.

The open one stays open: whether any of this is a rule, or a mistake I happen to
make often. Section 3b is the strongest thing said against it, and section 6 is
the second strongest — **the example claiming that evidence must name what it is
about shipped without evidence naming what it was about.**
