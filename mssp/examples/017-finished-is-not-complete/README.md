# 017 — Finishing and being complete are two different things

> `candidate`. Example 016 took `finished` away from the unit and named the cost
> on the board the same day: a source that *knows* it did not return everything
> now has nowhere to say so. This is that cost paid back, and it does not come
> free.

## What this program does

Four sources hand over records. **Every one of them finishes. None of them
fails.** They are not all complete.

```bash
python src/main.py             # the run under the deployment SCL names
python src/main.py --axes      # finished and complete, side by side
python src/main.py --strict    # exit 1 when a source declared itself incomplete
python src/island_test.py      # 42 checks across 6 sections, and it prints the count itself
```

```console
  source             outcome   records   finished   complete
  ok full-page        worked    3         True       not known to be otherwise
  ok quiet-truncation worked    2         True       not known to be otherwise
  ok short-page       worked    2         True       not known to be otherwise
  ok truncated-page   worked    2         True       no - declared (more-after-cursor)

  at least 2 of 9 records come from a source that declared itself incomplete.
  This is a FLOOR and not a count: a source that is truncated and says nothing is
  reported in the same column as one that is complete.
```

## The structural decision

Completeness **cannot be observed from outside the unit**. Nothing in SMS can
see the cursor a source was not allowed to follow. So it has to be declared —
and [例 016](/html/mssp/016-partial-and-complete.html) had just concluded that a
fact a unit could get wrong should not be the unit's to state.

The resolution is **directional**:

> **A unit may declare itself incomplete. It may not declare itself complete.**

A declaration that can only make the report **worse for the declarer** is taken
on trust; there is no motive to forge it, and a forged one degrades the report
conservatively. A declaration that makes it better is refused, because nothing
outside the unit can check it. `COMPLETE = True` fails the build.

Two things follow, and the second is the price:

1. **The completeness column has two values, not three** — `no - declared` and
   `not known to be otherwise`. There is no *verified complete* state, because
   nothing here can produce one. A report offering "complete" is claiming
   something it did not measure.
2. **The number is a floor.** "At least 2 of 9" — and the report says the word
   FLOOR, says "at least", and says why. Section 5 checks all three, and a
   mutation that changes "at least" to "exactly" turns it red.

## The island test — and the control that lets section 3 go badly

`short-page` returns **two** records, finishes cleanly, and genuinely has
nothing more. `truncated-page` returns **two** records and finishes just as
cleanly.

```text
  PASS  short-page returned two records
  PASS  and it finished
  PASS  and it is genuinely complete - the control
  PASS  truncated-page returned two records as well
  PASS  and it finished just as cleanly
  PASS  so neither the count nor `finished` separates them
  PASS  only the declaration does - not known to be otherwise vs no - declared
```

**And the gap is kept in the tree as a running unit.** `quiet-truncation` is
truncated in exactly the way `truncated-page` is and declares nothing, so the
collector reports it identically to `short-page`, which is complete. Section 6
**asserts that indistinguishability** — if it ever goes red, the limit changed
and these documents are wrong.

Five mutations were run and each one turns the suite red: the declaring source
going quiet (6 checks), the control declaring too (5), SMS accepting a
self-serving declaration (3), the report offering an exact count (1), and the
silent unit starting to declare (5).

## Upstream, the same day

[Archaeology 017](/html/mssp/archaeology/017-cpython-zlib.html) measures the
sharpest version of this I have found. A truncated zlib stream and a complete
one, through `decompressobj`:

```text
    truncated stream -> 218 bytes  eof = False
    complete  stream -> 218 bytes  eof = True
    byte-identical   : True
    told apart by any returned value: False
    told apart by .eof              : True
```

**Byte-identical.** And `.eof` is on the decompressor, not on the bytes — so a
function that decompresses and returns bytes has destroyed the distinction
before its caller ever sees it. Meanwhile `zlib.decompress`, the one-shot in the
same module, **raises** on that input.

## What this example does not solve

**The gap the floor exists because of.** A truncated source that says nothing is
not detectable here, and `quiet_truncation.py` is in the tree so that the hole
is a unit somebody can run rather than a sentence somebody can skip.

**Measurable, not measured.** How many real sources are in a position to know
they are incomplete — a paginator does, a full table scan does not — and
therefore how large the gap between the floor and the truth typically is.

**Not measurable here.** Whether a declared-incomplete export should be served.
`fatal`, `degrade` and `ignore` are all defensible and SCL picks one.

**Not attempted:** following the cursor. Resumption was deferred by example 016
and is deferred again.

**And one thing this got for free that should be said out loud:** removing
`truncated-page` — the island test's own move — takes the *warning* away and
leaves the other truncation exactly where it was. That is a third relationship
between removal and real failure, after [015](/html/mssp/015-present-and-failing.html)
(equal) and [016](/html/mssp/016-partial-and-complete.html) (removal gives more):
**removal can improve the report without changing what is true.**
