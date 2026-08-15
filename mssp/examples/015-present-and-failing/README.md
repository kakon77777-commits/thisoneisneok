# 015 — Working and absent are not the two options

> `candidate`. This one names a gap in MSSP's own core criterion, not in an example.

## What this program does

It gathers records from three sources and keeps four outcomes apart instead of
counting them.

```bash
python src/main.py             # the run under the policy SCL names
python src/main.py --compare   # remote-index removed, and remote-index broken
python src/main.py --strict    # exit 1 when a source failed and the policy is fatal
python src/island_test.py      # 24 checks across 7 sections
```

```console
  source          outcome   records   failed with
  -- archive-dump empty     0
  ok local-files  worked    2
  !! remote-index failed    0         unreachable

  2 record(s) — DEGRADED: remote-index failed

  what a count alone would have said:
    archive-dump    0 records — and this is empty
    remote-index    0 records — and this is failed
    three different situations, one number
```

## The structural decision

**A capability can be present, resolved, called, and failing.** That is a third
state, and the method has no drill that produces it.

```console
$ python src/main.py --compare

                           records   outcome for remote-index
  removed (island test)    2         absent
  present and failing      2         failed
```

**Same total.** The island test — MSSP's own structural criterion — takes a unit
away and sees what survives. It cannot produce the row underneath, and that row
is where a running system spends its bad days.

So a unit must declare **what it can fail with**, not merely that it might; and
a report must keep `failed` apart from `empty`, because both are zero.

## The island test — and `empty` as a category, not a synonym

`archive-dump` is in the example for one reason: it returns zero records and has
**not** failed. Without it, "zero records" and "failure" would be one observation
and section 3 could not come out badly.

```text
  PASS  archive-dump returned zero records
  PASS  and it did NOT fail - the control
  PASS  remote-index also returned zero records
  PASS  and it DID fail
  PASS  so a count cannot separate them, and the outcome field can - 0 == 0, empty != failed
```

## Upstream, the same day

[Archaeology 015](/html/mssp/archaeology/015-cpython-os-walk.html) measures where
this state is produced constantly and named nowhere. A subdirectory that
disappears between `os.walk`'s top-level listing and its visit:

| mode | files | errors |
|---|---|---|
| default (`onerror=None`) | `['a.txt', 'c.txt']` | none reported |
| with `onerror` | `['a.txt', 'c.txt']` | `FileNotFoundError on b` |

**Same files. The only difference is whether anybody was told** — the same shape
[example 012](/html/mssp/012-two-writers.html) found in a lost update.

## What this example does not solve

**Measurable, not measured.** How often a real source is present-and-failing
rather than absent, and what a degraded run costs a caller who served it as
complete.

**Not measurable here.** Whether a degraded run should be served at all —
`fatal`, `degrade` and `ignore` are all defensible, and SCL picks one.

**And a known hole rather than an oversight: partial failure.** A source that
returned some records and *then* broke is a fifth outcome, and the classifier
here would call it `worked`. The island test says so out loud rather than
leaving it for someone to find.
