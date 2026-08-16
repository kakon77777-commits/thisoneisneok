# 016 — A partial result and a complete one are the same value

> `candidate`. Example 015 wrote partial failure into its own limitations as a
> fifth outcome it did not model. This is that limitation gone, and it turned
> out not to be a fifth label.

## What this program does

Three sources hand over records. One of them hands over real records and then
breaks. Two combiners disagree about what to do with the ones that arrived.

```bash
node src/main.mjs             # the run under the combiner SCL names
node src/main.mjs --compare   # removing the broken source, against keeping it
node src/main.mjs --strict    # exit 1 when a run did not finish and the policy is fatal
node src/island_test.mjs      # 41 checks across 7 sections, and it prints the count itself
```

```console
  source          outcome   records   finished   error
  ~~ breaks-midway partial   2         false      connection-reset
  ok full-batch    worked    3         true
  ok short-batch   worked    2         true

  all-or-nothing: REFUSED - breaks-midway (partial): connection-reset
  7 record(s) already in hand were discarded, and the work that produced them ran to completion anyway.

  what a count alone would have said:
    breaks-midway   2 records - and this is partial
    short-batch     2 records - and this is worked
    2 sources, one number, 2 outcomes
```

## The structural decision

**Once records are in one array, a partial batch and a complete batch are the
same value.** So the outcome cannot travel *beside* the records. It has to
travel **with** them, which means a record carries which unit produced it.

Two things follow, and neither is a fifth label bolted onto example 015's four:

1. **`finished` is not the unit's to declare.** The collector drives the
   iterator and observes where it stopped. A source that throws after yielding
   cannot report that it finished, because it never reports it. What a unit
   still declares is what it can fail *with* — [改良點 13](/html/mssp/modules/development.html), kept.
2. **How the results are combined is itself a declaring unit**, and what it
   declares is what it does with work that already succeeded.

```console
$ node src/main.mjs --compare

                                          kept   what the reader ends up holding
  removed (island test)   all-or-nothing  5      2 complete sources
  present and failing     all-or-nothing  0      nothing - 7 records discarded
  present and failing     settle-each     7      2 of them from a source that did not finish
```

**Removing the broken source gives more than keeping it.** [Example 015](/html/mssp/015-present-and-failing.html)
measured the opposite — there, removed and broken produced the same number.
Between them the two entries say: the island test's result relative to a real
failure is not fixed, and can point either way.

## The island test — and the control that lets section 3 go badly

`short-batch` yields **two** records and finishes. `breaks-midway` yields
**two** records and throws. Without the control, "two records" and "broke after
two records" would be a single observation.

```text
  PASS  short-batch yielded two records
  PASS  and it DID finish - the control
  PASS  breaks-midway yielded two records as well
  PASS  and it did NOT finish
  PASS  so a count cannot separate them, and the outcome can - 2 == 2, worked != partial
```

Four mutations were run against the suite and each one turns it red: making the
control break too (7 checks), letting `all-or-nothing` keep the partial work
(3), removing the origin check from the collector (1), and classifying `partial`
as `worked` (8).

## Upstream, the same day

[Archaeology 016](/html/mssp/archaeology/016-promise-all.html) measures the two
combiners as built-ins. Four promises, one rejects:

| combinator | kept | ran | reasons |
|---|---|---|---|
| `Promise.all` | 0 | `a,b,c,d` | 1 |
| `Promise.allSettled` | 3 | `a,b,c,d` | 1 |

**Every member ran under both.** Three fulfilled values existed and none of them
is reachable from the rejection. And with two rejecting members, exactly one
reason surfaces.

## What this example does not solve

**Measurable, not measured.** How often a real source breaks after yielding
rather than before, and what a discarded batch costs when the work behind it was
paid for.

**Not measurable here.** Whether keeping partial work is right. `all-or-nothing`
is correct for a nightly index that must not publish a half crawl, and wrong for
a dashboard; SCL picks one and this example takes no position.

**And a limit that is asserted rather than assumed:** a source that catches its
own failure internally and returns early reports as `worked`, and is
indistinguishable from `short-batch` by every field this collector reads.
Section 7 asserts exactly that — **if it ever goes red, the limit has changed
and this paragraph is wrong.**

**Not attempted:** retries, resumption, cursors. Restarting a source that broke
at record two is a different problem, and it has to be nameable first.
