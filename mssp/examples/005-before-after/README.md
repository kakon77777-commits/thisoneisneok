# 005 — The same program, before and after: measuring what the restructuring cost

## What this program does

It reads a small table of sensor readings, drops the invalid rows, and prints a
summary in one of three formats. It is written twice.

```bash
node baseline/monolith.js          # the before: one file, 69 lines
node src/main.js                   # the after: MSSP, same output
node src/main.js --measure         # the comparison
node src/island-test.js            # each format alone, and the measurement's own honesty
```

`baseline/monolith.js` is **not a strawman**. It is what a competent person
writes for a job this size, and it is shorter and clearer than the restructured
version. That is part of the finding, not an oversight.

## The structural decision

**Measure the restructuring instead of asserting it — and use a measurement
capable of coming out against MSSP.**

The four examples before this one demonstrated structure. None produced a
number. [開發區 缺點 5](/html/mssp/modules/development.html) says the cost at
small scale is real and that the method has no quantitative tool for it, so this
is the tool, applied to one program.

```console
$ node src/main.js --measure

                                     before    after
  total lines                            69      144    +
  files                                   1        9    +
  lines to exercise one capability       69        8   ok
  files to exercise one capability        1        1    =
  files touched to add a format           1        2    +
  EXISTING files changed to add it        1        1    =
  lines to understand one capability     69        8   ok

  ok = the restructuring helped on this axis, + = it cost
```

**Three costs, two benefits, two ties.** The restructuring does not dominate at
this size, and the honest reading is that it buys one thing and charges for
another:

- **It buys isolation.** To run the CSV renderer you load 8 lines instead of 69,
  and to understand what it does you read 8 lines instead of 69. That ratio is
  the whole argument for the method, and here it is 8.6×.
- **It charges total volume.** 69 → 144 lines, 1 → 9 files. More than double, to
  do exactly the same thing, with byte-identical output.
- **On coupling to existing code it is a tie**, which surprised me. Adding a
  third format changes exactly one pre-existing file in both versions. What
  differs is *which*: the monolith's is code, MSSP's is `SCL/policy.json`. That
  is a real distinction and it is not a number.

The two "=" rows are the ones I would not have predicted, and they are why the
measurement was worth writing rather than reasoning about.

### What the measurement caught in this example

**A dispatch branch in the core.** `main.js` originally read:

```js
const wanted = argv.includes("--csv") ? "formats/csv" : "formats/text";
```

That is a branch per format in the core — the exact coupling the restructuring
exists to remove — and it meant adding a format touched `main.js` after all. It
was invisible while there were two formats. Adding a third made `--json` print
text, and the fix was to derive the format from policy instead. **The structure
looked right and had the seam still in it.**

**The instrument found itself.** The check for "which pre-existing files mention
the new capability" grepped for `formats/json` and reported `DMS/measure.js` —
which contains the string by virtue of being the thing that searches for it. An
instrument that matches itself is measuring the wrong object.

**A comment describing a removed branch.** The island test's check that `main.js`
does not name a format matched the comment explaining the branch that had just
been deleted. Third time this week a check has reported on prose describing the
thing rather than on the thing; it now reads code lines only.

## Set by set

**FMS** — `manifest.json`, and the two decisions above.

**SCL** — `policy.json` / `policy.js`. The plausibility window (`-60..60` °C) and
the set of formats this deployment recognises. In the monolith the window is a
`const` beside the validator, which is correct and also means changing it is a
code change reviewed as a code change.

**SMS** — `model`, `validate`, `summarise`. Remove any of them and there is no
report.

**TMS** — `formats/text`, `formats/csv`, `formats/json`. Three units. The island
test notes that a format file **imports nothing at all**, not even SMS: it takes
plain values, which is why 8 lines is the true cost of loading one.

**DMS** — `measure.js`. It measures the structure the program is in, which is
what makes this example possible at all.

## The island test

```console
$ node src/island-test.js
  ... 17 checks across 5 sections ...
  island test passed
```

Section 2 is the one that matters and it is unusual: **it checks that the
measurement is capable of disagreeing with the method that produced it.**

```text
  PASS  at least one axis reports a cost - 3 cost row(s)
  PASS  at least one axis reports a benefit - 2 benefit row(s)
  PASS  total lines went UP, and the table says so - 69 -> 144
  PASS  this measurement is therefore capable of disagreeing with MSSP
```

A table where every row favours the author is not a measurement. This is
[改良點 6](/html/mssp/modules/development.html) applied to a number instead of
to a check — and the number passes, because the restructuring genuinely costs
on three axes and the table prints all three.

Section 5 runs both versions and compares their output byte for byte. Without
it, "the same program" is a claim.

## What this example does not solve

- **n = 1.** One program, at a size the method's own scale guidance puts *below*
  its threshold. Whatever this table shows, it shows about this program. The
  interesting version is the same measurement across twenty programs of
  different sizes, and that is [改良點 5](/html/mssp/modules/development.html)'s
  shape, not this one's.

- **Every axis here is static.** Lines, files, imports. None of them measure the
  thing MSSP actually claims to buy — that a change stays contained — because
  measuring that needs a history of changes, not a snapshot of two versions. The
  "files touched to add a format" row is the closest approximation and it is one
  data point produced by me, who knew what answer would be convenient.

- **"Lines to understand one capability" flatters the restructured version.**
  It counts the format file alone, because a format file has no imports. But a
  reader who wants to know *when* that format is used has to read `main.js` and
  `policy.json` too, and the monolith's 69 lines contain that answer already. I
  measured what is cheap to measure.

- **The tie on existing-files-changed may be an artefact of three formats.** At
  three, both versions change one file. At thirty, the monolith's one file is
  1,200 lines and MSSP's is still a policy entry — but I have not built the
  thirty-format version, so that sentence is a prediction and this section is
  where predictions go.
