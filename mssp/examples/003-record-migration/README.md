# 003 — Record migration: what "500 migrated, 0 errors" actually says

## What this program does

It takes a batch of records, runs each one through a set of field transforms —
split a `name` into given and family, rewrite a `phone` into a canonical form —
and reports what happened.

```bash
node src/main.js            # the ledger
node src/main.js --summary  # the sentence a normal migration tool prints
node src/island-test.js     # each transform alone, plus four attempts to make the ledger lie
```

No dependencies, no source database, no destination. The records are a literal.

## The structural decision

**DMS is not the run log. Its job is to make a successful run checkable — and a
successful run is the hard case, because failure announces itself and success
does not.**

Here is what a migration normally tells you:

```console
$ node src/main.js --summary

  5 records migrated, 0 errors
```

Every word is true. It is also word-for-word what you would get from:

- a run that migrated all five correctly;
- a run where no transform matched anything, so nothing changed;
- a run that returned early after two records and counted the rest as skipped;
- a run over an empty input.

The sentence cannot distinguish them, and it is the sentence almost every batch
tool prints. So the ledger answers three questions it cannot.

**1. Does the arithmetic balance?** Every record must appear exactly once across
the four outcome kinds. Zero failures is a claim about one bucket; it says
nothing about whether the loop visited everything it was handed. A shortfall
means records were lost somewhere the failure counter never reached, and that
makes the run untrustworthy regardless of how clean the error column looks.

This lives in **SMS**, not DMS. A report that computed its own correctness would
be marking its own work; the pipeline cannot honestly return a result without
reconciling, so reconciliation is part of closing the loop.

**2. Can I see one?** Two witnesses per outcome kind, printed before and after —
including for records nothing changed, with the reason. An `unchanged` count on
its own is an assertion; an `unchanged` count next to `one token only; splitting
it would be a guess` is a decision a reader can disagree with.

**3. What did not happen?**

```text
  capabilities
    transforms/split-name      invoked   4, changed   3, declined   1
    transforms/normalise-phone NEVER INVOKED
                                 declined 5 record(s); reads phone
                                 this run says nothing about whether it works
```

Not one record in the fixture carries a phone number. The phone transform is
loaded, correct, and never reached. **It is not an error and it is not a
success — it is the absence of evidence, and the report has to be able to say
which of the three it is.**

This is the decision the example exists for. A capability that was never invoked
is reported as loudly as one that failed, because a green run over an input that
never reaches a transform is the commonest way to believe something works that
has never once executed.

## Set by set

**FMS** — `manifest.json`. What the program is, what each capability does, and
the two decisions above with their reasons. No procedure.

**SCL** — `policy.json` and `policy.js`. One permission: `may_drop`. Rewriting a
field and removing a record are the same shape in code — a function returning an
outcome — and only one of them loses data, so the difference is stated as data a
runtime reads rather than a rule a transform is trusted to respect. A drop from
a transform that may not drop is recorded as *that transform's* failure, and the
record stays accounted for.

**SMS** — `model.js` (the four outcome kinds), `reconcile.js` (the arithmetic),
`pipeline.js` (the loop). The pipeline imports no transform; it is handed a
list, which is what lets the island test hand it exactly one.

**TMS** — `transforms/split-name` and `transforms/normalise-phone`. Two units in
one category directory, so an import between them is a violation. Neither knows
the other exists.

**DMS** — `ledger.js`. Renders; decides nothing. `assessment()` is separate from
`render()` because the report is for a person and the assessment is for a caller
that has to act — and the two answers differ: this run is *trustworthy* (it
balances) and only partly *demonstrative* (one capability never ran).

## The island test

```console
$ node src/island-test.js

== 1. transforms/split-name alone
  PASS  runs with no sibling loaded - 2 of 2 accounted for
  PASS  split-name was actually invoked - invoked 2
  PASS  phone fields survived untouched - the absent transform left its fields alone rather than nulling them

== 2. transforms/normalise-phone alone
  PASS  runs with no sibling loaded
  PASS  normalise-phone was actually invoked
  PASS  it changed the one that needed changing - 1 applied; the already-normalised number came back unchanged
  PASS  assessment reports nothing unexercised here

== 3. reconciliation rejects a lost record
  PASS  a shortfall is unbalanced - missing 2
  PASS  and the shortfall is reported, not just flagged
  PASS  an exact match still balances

== 4. reconciliation rejects a duplicated record
  PASS  counts alone would have passed
  PASS  the duplicate is caught anyway - duplicated [d-1]

== 5. the ledger cannot hide an unexercised capability
  PASS  the report names it
  PASS  and says what it would have needed
  PASS  assessment agrees
  PASS  and stops saying it when the capability does run - otherwise the warning is decoration that is always present

== 6. SCL refuses a drop from a transform that may not drop
  PASS  the drop did not take effect - outcomes: failed
  PASS  it was recorded as a failure, not silently ignored
  PASS  the record is still accounted for
  PASS  assertMayDrop itself throws

  island test passed
```

Sections 1–2 are the island test proper. **Sections 3–6 are there because of
[改良點 6](/html/mssp/modules/development.html): every claim this example makes
rests on the ledger being able to say no, and a check nobody has watched fail is
not yet a check.**

Two of them are worth reading closely.

Section 4 builds a ledger where the totals agree — two records in, two outcomes
out — and one id appears twice. **Counting alone passes it.** Reconciliation only
catches it because it checks identity as well as arithmetic, which is a
distinction that would never have come up if the check had been written as
`accounted === input` and left there.

Section 5 checks both directions. The report must say `NEVER INVOKED` when the
capability is unreached, *and must stop saying it* when the same code runs with
phone numbers present. A warning that is always there is not a warning.

## What this example does not solve

- **The ledger cannot tell you the transform is correct.** It shows you a
  before/after pair and reports that split-name declined a single-token name.
  Whether "Prince" should have become `given_name: "Prince"` with no family name
  is a decision about the data, and nothing here can make it. The most the
  report can do is put the decision where a person will see it — which is why
  the reason string is printed rather than the count alone.

- **"Never invoked" is a fact about this input, not about the code.** It says
  the run supports no claim, not that the capability is broken or unused. The
  ledger has no way to distinguish a transform that never matches from one that
  never *should* match here, and treating the warning as a defect would train a
  reader to silence it.

- **Reconciliation catches lost records, not wrong ones.** A pipeline that
  transformed every field into `null` would balance perfectly. The arithmetic
  proves the loop visited everything; the witnesses are the only thing standing
  between that and a confident, complete, entirely wrong migration — and two
  samples out of five is a spot check, not coverage.

- **The witness sample is first-N, which is the weakest possible sampling.** If
  the first two `applied` records happen to be the easy ones, that is what gets
  printed. A real ledger would sample by shape — longest, shortest, most fields
  changed — or let the reader ask. That would be a better example and a worse
  demonstration of one idea, so it is left undone and named here instead.

- **At this size the structure costs more than it returns.** Five sets and a
  policy file to migrate five records is not a trade anyone should make. What it
  buys is that the ledger's job is *visible as a separate job* — in a single
  file, `console.log` at the end of the loop would have been the report, and
  nobody would have asked what a report owes its reader.
