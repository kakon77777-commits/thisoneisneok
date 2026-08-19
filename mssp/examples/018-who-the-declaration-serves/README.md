# 018 — Who a declaration serves is decided by whoever reads it

> `candidate`. On 2026-08-17 I asked the board to attack 改良點 15's trust
> criterion, and said I could not construct the counter-case convincingly.
> This is the counter-case. It lands on the sensible policy.

## What this program does

Three sources, two deployment policies, and one unit that declares itself
incomplete. The example does not argue about whether that declaration is
self-penalising. **It measures it.**

```bash
node src/main.mjs             # the run under the policy SCL names
node src/main.mjs --compare   # both policies, side by side
node src/main.mjs --strict    # exit 1 when the measurement contradicts SCL's assumption
node src/island_test.mjs      # 46 checks across 8 sections, and it prints the count itself
```

```console
  catalogue-sync: apply retry-declared, assuming declarations are self-penalising

  source        held   kept   declared                note
  full-page     3      3      -
  honest-page   6      6      more-after-cursor       re-run at budget 2
  silent-page   6      3      -
  total kept: 12

  what declaring cost or paid, measured by suppressing it and re-running:
    unit          suppressed   declared   delta   reading
    full-page     3            3          0       declared nothing - the control
    honest-page   3            6          +3      declaring PAID
    silent-page   3            3          0       declared nothing - the control

  CONTRADICTS SCL: declaring left honest-page better off by 3 record(s) (3 suppressed -> 6 declared)
  SCL assumes declarations are self-penalising; under this policy they are not.
```

## The structural decision

[改良點 15](/html/mssp/modules/development.html) takes a *self-penalising*
declaration on trust. **Self-penalising is not a property of the declaration.**
It is a property of the declaration together with the policy that consumes it,
and the same declaration points opposite ways under two policies that are both
defensible:

| | what it does with a declaration | incentive for the declaring unit |
|---|---|---|
| `refuse-declared` | drops the source | **−3** (3 suppressed → 0 declared) |
| `retry-declared` | re-runs it with more budget | **+3** (3 suppressed → 6 declared) |

**Neither is a strawman.** A compliance export is right to drop anything
known-partial. A catalogue sync is right to spend more on a source that just
told it more is available — that declaration is precisely the signal that
spending will pay.

So the judgement is not removed. It is **written down where something can
disagree with it**:

1. **SCL states the assumption** — `assumes_declarations_are: "self-penalising"`.
2. **The build measures it, with a counterfactual.** Run the pipeline again with
   that unit's declaration suppressed and compare what the unit contributes.
3. **A contradiction is fatal.** Under `retry-declared` it contradicts, and
   `--strict` exits 1.

An incentive is never printed as a bare number. `+3` alone is a figure nobody
can re-derive, so the report prints the pair it came from.

## The island test — and the control that makes the measurement mean anything

`honest-page` and `silent-page` hold **six records each** and hand over exactly
as much per unit of budget. The **only** difference between the two files is
that one declares.

```text
  PASS  honest-page and silent-page hold the same number of records - 6 and 6
  PASS  at budget 1 they hand over the same number - 3
  PASS  at budget 2 they hand over the same number - 6
  PASS  at budget 3 they hand over the same number - 6
  PASS  and at budget 1 exactly one of them declares
  PASS  so any difference between them is attributable to the declaration alone
```

And under `retry-declared`, **the honest unit ends up ahead of the silent one
holding identical data — 6 against 3.** Declaring paid; staying quiet cost.

Five mutations were run and each turns the suite red: the control holding a
different amount (4 checks), the retry policy not retrying (6), SCL never
finding a contradiction (1), the counterfactual comparing a run with itself (8),
and FMS carrying a stale number (1).

## Upstream, the same day

[Archaeology 018](/html/mssp/archaeology/018-object-freeze.html) measures a
declaration whose force is decided entirely by its consumer:

```text
    object        mode     returned   actual   threw
    frozen        sloppy   999        100      -
    frozen        strict   -          100      TypeError: Cannot assign to read only property
    never frozen  sloppy   999        999      -
```

`Object.freeze` says *immutable* and **takes no argument about what violating it
means** — `Object.freeze.length` is 1. A sloppy-mode consumer gets no error, and
**the assignment expression still evaluates to 999 while the object keeps 100**.
Row 3 is the control: an object that was never frozen also returns 999, which is
what makes `returned` uninformative rather than merely wrong.

## What this example does not solve

**The counterfactual measures one unit, one policy, one run's data.** It is not
a general statement about that declaration, and the example does not pretend
otherwise.

**A zero reading is ambiguous.** A unit that declared nothing and a unit whose
declaration cannot be suppressed both measure as 0. Section 8 asserts that
ambiguity, so if it ever stops being true this page is wrong and goes red.

**Nothing here reads intent.** A unit that benefits by accident is
indistinguishable from one that planned to. The reading is outcome only, and
section 8 checks that no part of SMS pretends otherwise.

**Not attempted:** deciding which policy is right, and enumerating which
policies are "rewarding". The second is why this is a measurement rather than a
rule — the set of rewarding policies cannot be listed, but the incentive under
*the policy in force* can be computed.
