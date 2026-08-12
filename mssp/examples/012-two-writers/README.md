# 012 — Two writers, and the schedule the test could not produce

> `candidate`. This is the limitation example 011 named for itself, gone after
> the next day.

## What this program does

Two writers increment the same counter. A schedule decides who moves next — and
it is written down rather than raced for, so what happens is a fact about the
code and not about this machine this morning.

```bash
node src/main.mjs             # what SCL runs, plus the combination it refuses
node src/main.mjs --all       # every medium x operation x schedule
node src/main.mjs --strict    # exit 1 when a requirement is unmet
node src/island_test.mjs      # 28 checks across 7 sections
```

```console
$ node src/main.mjs --all

  medium        operation           schedule                ends at   lost   was anybody told?
  atomic-file   compare-and-set     interleaved             1         1      yes, refused
  atomic-file   compare-and-set     one-at-a-time           2         -      -
  atomic-file   compare-and-set     interleaved + retry     2         -      -
  atomic-file   read-modify-write   interleaved             1         1      NO, silently
  atomic-file   read-modify-write   one-at-a-time           2         -      -
  atomic-file   read-modify-write   interleaved + retry     1         1      NO, silently
  torn-file     compare-and-set     interleaved             1         1      yes, refused
  torn-file     read-modify-write   interleaved             1         1      NO, silently
```

## The structural decision

**An operation declares what it REQUIRES; a medium declares what it GUARANTEES;
the store compares them and fails closed.**

```console
  !! read-modify-write requires serialised-transaction; atomic-file guarantees atomic-replace - fail closed
```

The consequence is the point: **no medium here provides `serialised-transaction`,
and none can.** A read-modify-write needs nothing to happen between its read and
its write, and that is not a property of a medium — it is a property of a
transaction. So the repair is the shape of the operation, not a better medium.

## Three things the table says that the numbers alone do not

**1. The medium column changes nothing.** `atomic-file` and `torn-file` agree on
every row. Atomicity of a write is a real guarantee and it is not the one a
read-modify-write needs — measured, not argued:

```text
  PASS  atomic-file and torn-file give identical outcomes under the same schedule
```

The archaeology filed the same day found exactly this upstream: `dbm.dumb` and
`dbm.sqlite3` **both** lose the update; only `dbm.dumb` corrupts.

**2. The two interleaved rows end at the same number.** `read-modify-write` and
`compare-and-set` both leave the counter at 1. What differs is that one of them
**said so**:

```text
  PASS  read-modify-write and compare-and-set end at the same value - both 1
  PASS  and only one of them reported anything
  PASS  retrying fixes the one that reported - ends at 2
  PASS  and does nothing for the one that did not - there was nothing to retry, because nobody was told
```

Compare-and-set does not make the second increment happen. It **refuses**, and a
refusal is worth exactly as much as somebody's willingness to retry.

**3. Every one-at-a-time row is clean.** That is the control, and it is the
methodological finding.

## The island test — section 4 is a control, not an assertion

```text
  PASS  all 4 one-at-a-time runs end at 2 with nothing lost - 2, 2, 2, 2
  PASS  all 4 interleaved runs lose one - 1, 1, 1, 1
  PASS  so the schedule, not the assertion, is what decides whether this is visible
```

**A single-writer test cannot see a lost update, however many assertions it
makes.** This is a different axis from the ones
[`mssp-d-003`](/html/mssp/discussions/mssp-d-003.html) has collected. Those ask
what an observation can distinguish and which event it is about. This one asks
what the test is **able to produce at all** — and no assertion can rescue a
schedule that never happens.

Section 6 checks the atomicity claim by running it rather than reading it: a
medium claiming `atomic-replace` must complete a write in **one step**, and the
island test interleaves inside a write to find there is no inside. `torn-file`
is the control, and it is observably torn:

```text
  PASS  and torn-file is observably torn halfway through a write - halfway: "{\"n\":1"
```

## What this example does not solve

**Measurable, not measured.** What retries cost under real contention, and how
often a real application's writes actually overlap.

**Not measurable here.** Whether these two schedules cover what a real scheduler
produces. Two are written down; a system with more steps has more of them, and
nothing here enumerates that space. **This is the honest limit of the whole
approach in this entry** — a written-down schedule proves a failure exists, and
proves nothing about the ones nobody wrote down.

**And whether compare-and-set is the right repair.** It converts a lost update
into a retry, which is a different problem rather than no problem.
