# 007 — Making the identity test executable, and finding out what it measures

## What this program does

It reconciles two ledgers — matching entries by id, comparing amounts within a
tolerance — and reports which entries disagree.

```bash
python src/main.py              # the reconciliation
python src/main.py --csv        # the same, as CSV
python src/main.py --identity   # run the identity test over the SMS roster
python src/island_test.py       # 21 checks across 6 sections
```

Six modules under `src/SMS/` claim to be structural. Three of them are not, and
the program is what says so.

## The structural decision

**Stop treating the identity test as a question a person answers once, and make
it something the build runs.**

[開發區 缺點 2](/html/mssp/modules/development.html) says SMS has no mechanism
against its own growth and that this is the method's most likely failure mode.
[改良點 1](/html/mssp/modules/development.html) proposes a budget — a count.
A count has to come from somewhere, and any number I pick is a rule with
nothing behind it.

But MSSP already defines the boundary in words: **remove it, and is the system
still itself?** So the number is not the thing to invent. The words are the
thing to make executable, and then the size of SMS is a result rather than a
target.

Two things went wrong on the way, and both are the content of this example.

### Deletion measures reachability, not necessity

The first version deleted each module and ran the program:

```text
  ok  parse          structural   ImportError: cannot import name 'parse' from 'SMS'
  ok  normalise      structural   ImportError: cannot import name 'normalise' from 'SMS'
  ...
  !!  format_money   NOT STRUCTURAL   ran, and produced byte-identical output
```

That table is worthless, twice over. **Every module the entry point imports
raises `ImportError` when deleted**, so deletion asks "is this reachable from
`main.py`", which is not the question. And the two modules it did flag were
flagged because I had not wired them into `main.py` at all — the test was
distinguishing dead code from live code and reporting it as a structural
finding.

The fix is **substitution**: each rostered module is replaced by a stub in
`DMS/stubs/` that keeps the signature and does nothing meaningful.

Writing that stub turns out to be the useful part. You cannot run this test on a
module without first saying *what this module would be if it did not matter* —
and for two of the six, writing that sentence was already the answer.

### The mechanisation needs a witness, and the witness decides the answer

"Still itself" needs someone to say what the program is **for**. A stub run that
exits 0 proves nothing on its own; the question is whether the answer survived.

`FMS/manifest.json` states it:

```json
"answer_witness": {
  "what_the_program_is_for": "Saying which ledger entries disagree, and how.",
  "present_when": "the output names every id that differs or is unmatched",
  "ids": ["INV-3", "INV-5", "INV-6"]
}
```

With that in place:

```console
$ python src/main.py --identity

  ok  parse          structural       runs, but the answer is gone: missing INV-3, INV-5, INV-6
  ok  normalise      structural       runs, but the answer is gone: missing INV-3
  ok  reconcile      structural       runs, but the answer is gone: missing INV-3, INV-5, INV-6
  !!  summarise      NOT STRUCTURAL   answer intact, output differs — presentation, not structure
  !!  format_money   NOT STRUCTURAL   answer intact, output differs — presentation, not structure
  !!  sort_entries   NOT STRUCTURAL   answer intact, and the output did not even change

  claimed SMS        6
  survives the test  3  parse, normalise, reconcile
  does not           3  summarise, format_money, sort_entries
```

**`summarise` coming out not-structural is the result I did not expect.** It
produces the counts. I would have called it obviously SMS. Under the witness I
wrote, stubbing it leaves the answer intact, because the rows come from the
reconciliation and not from the summary.

Two readings, and I cannot settle between them from inside:

- the witness is too weak, and the counts genuinely *are* part of the answer;
- or `summarise` really is a convenience view over data the report already holds.

Section 3 of the island test settles what *kind* of question that is, by running
the whole thing again with a stricter witness:

```text
  PASS  under the stated witness, summarise is not structural
  PASS  under a witness that also requires the counts, it is
  PASS  and nothing else moved - ['normalise','parse','reconcile','summarise'] vs ['normalise','parse','reconcile']
```

One module moves. Nothing else does. So:

> **The mechanised identity test does not decide which modules are structural.
> It decides whether a structure is consistent with a stated purpose.**

That is less than I set out to build and more useful than a budget. A number
tells you SMS is too big. This tells you *which* module is not carrying its
claim, **relative to a sentence you had to write down** — and writing that
sentence is the part no mechanisation removes.

`normalise` is worth a look too: it is structural, but only INV-3 disappears
without it. With every amount zeroed, the two ledgers agree within tolerance and
the differing row vanishes, while the unmatched ids survive because they are
matched by id. **The verdict is binary and the evidence is partial**, and the
report prints the partial evidence rather than the verdict alone.

## Set by set

**FMS** — `manifest.json`: the roster, and the witness. The witness is the only
place in this example where a human judgement is written down as data.

**SCL** — `policy.json`: the tolerance (2 cents, which is why INV-2's one-cent
difference is a match) and which reports this deployment permits.

**SMS** — six modules, three of which survive their own test.

**TMS** — `reports/text`, `reports/csv`. Neither imports anything, not even SMS.

**DMS** — `identity.py` and `stubs/`. It runs subprocesses over a copy of the
tree, because the only honest way to ask "does this work without the module" is
to not have the module.

## The island test

```console
$ python src/island_test.py
  ... 21 checks across 6 sections ...
  island test passed
```

Section 4 is the failing-case section. It substitutes `reconcile.py` **as its
own stub** and requires the test to report NOT STRUCTURAL — because a
substitution that changes nothing has proved nothing, and a test that reported
"structural" there would be reporting on the module rather than on the
substitution. It also requires a module with no stub to be refused rather than
skipped: this test cannot say anything about a module nobody has written a
neutralisation for, and silence would look like a pass.

## What this example does not solve

Following [改良點 8](/html/mssp/modules/development.html), each item says what
turning it into a measurement would take.

- **One run, one input.** *(needs new code: a corpus of inputs and a per-input
  verdict.)* A module can be genuinely required on inputs this ledger does not
  contain. `parse` is structural here because the sample has rows; on empty
  input every module would look structural or none would. The verdict is a
  statement about this run, and the report does not currently say so on its own
  face.

- **The witness is one sentence and I wrote it.** *(unmeasurable in principle
  from inside the example.)* Section 3 shows the roster moves when the witness
  moves. It does not show which witness is right, and nothing in the method
  says how to write one. That is the gap this example opens rather than closes.

- **Stubs are hand-written, so the test is only as honest as they are.**
  *(needs new code: a generated stub from the signature, plus a check that the
  stub is not accidentally faithful.)* Section 4 catches the extreme case — a
  stub identical to the module — but a stub that is *nearly* faithful would
  pass quietly. A generated one would remove the author's chance to write a
  convenient stub.

- **`summarise` is left unresolved on purpose.** *(needs a criterion, not a
  measurement.)* I did not demote it. Demoting it would mean deciding the counts
  are not part of the answer, and I do not think one example is enough to decide
  that about a program I invented for the example.

- **The relationship to a numeric budget is untested.** *(one command per
  candidate, but no repo to run it on yet.)* If this test were run on a real
  project with a large SMS, it would either agree with a count-based budget or
  disagree with it, and that comparison is the thing that would tell you whether
  改良點 1 should become this instead of a number. I have no such project
  instrumented, and one invented ledger is not evidence about real ones.
