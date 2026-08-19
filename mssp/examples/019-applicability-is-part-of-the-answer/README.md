# 019 — A measurement has to say when it does not apply

> `candidate`. Example 018 wrote this into its own limitations: its incentive
> number read 0 both for a unit that declared nothing and for a unit whose
> declaration could not be suppressed. This is that limitation gone.

## What this program does

It runs example 018's counterfactual again and **refuses to hand back a value it
did not compute**.

```bash
python src/main.py             # the run under the policy SCL names
python src/main.py --control   # the same units under a policy that ignores declarations
python src/main.py --total     # ask for a total across all three
python src/main.py --strict    # exit 1 on an unmeasurable unit or a contradicted assumption
python src/island_test.py      # 51 checks across 8 sections, and it prints the count itself
```

```console
  unit              suppressed   declared   incentive   reading
  baked-in          -            6          n/a         NOT MEASURED: the declaration is not a
                                                        separable field - suppressing it would also
                                                        remove a record, so the two arms would not
                                                        be comparable
  declares-openly   3            6          +3          declaring PAID
  never-declares    3            3          0           measured zero - both arms ran and agreed

  what a bare number would have said:
    baked-in          0 - and this is not measurable
    never-declares    0 - and this is measured, and genuinely zero
    2 units, one number, 2 kinds of answer
```

## The structural decision

**A measurement returns a value and its applicability.** The repair is not a
better number — no number would have worked, because the two situations were
never the same quantity.

```python
{"applicable": True,  "value": 3, "reason": None}
{"applicable": True,  "value": 0, "reason": None}      # measured zero
{"applicable": False, "value": None, "reason": "..."}  # not measurable
```

Three consequences, and the third is the one that generalises:

1. **A unit declares whether its declaration can be suppressed.** One that will
   not say is refused — the harness would otherwise report a zero it never
   computed.
2. **SCL can only be contradicted by something that was measured.** A reading
   that was never taken neither confirms nor contradicts the assumption, and
   `main` names it on its own line so it cannot read as agreement.
3. **The aggregator refuses.** `total_incentive` raises rather than skipping the
   unmeasured unit, because a sum that quietly omits what it could not read
   prints a smaller number with the same confidence as a complete one.

This is the shape [example 015](/html/mssp/015-present-and-failing.html) opened
this run with — several situations arriving as one number — moved from the data
to **the instrument that reads the data**.

## The island test — and the control that makes zero a real category

Under `ignore-declared`, `declares-openly` measures **zero, and it was
measured**: both arms of the counterfactual ran and agreed. Without a policy
that produces a real zero, every zero in the report would have meant "nothing to
measure" and section 3 could not come out badly.

```text
  PASS  under ignore-declared, declares-openly measures zero
  PASS  and it WAS measured - both arms ran
  PASS  and they agree - 3
  PASS  baked-in also reads as nothing
  PASS  but it was not measured
  PASS  so a bare 0 cannot separate them, and applicability can
```

**Section 4 proves the unmeasurable unit's stated reason by running it** rather
than believing the sentence: suppressing the field leaves `baked-in`'s marker
record behind, while a suppressible unit's two arms are record-identical and
differ only in the declaration field.

Five mutations were run and each turns the suite red: reporting the unmeasurable
unit as a plain zero (6 checks), the total skipping what it could not read
(raises), the control policy starting to retry (4), `baked-in` no longer baking
it in (4), and a non-applicable reading counted as a contradiction (1).

## Two defects of mine, found by the drills in this entry

**The loader crashed on a policy module with no `POLICY`** instead of refusing
it by name. An unknown shape is a case to classify, not an exception to raise.

**And the first fix was not enough.** I added the check, and the line that
*registered* the module still read the attribute the check had just reported
missing — so a refused module crashed the loader anyway. A guard that does not
cover the code after it is not a guard. Both are fixed and both now have drills.

## Upstream, the same day

[Archaeology 019](/html/mssp/archaeology/019-dict-get-sentinel.html) is the most
ordinary line of Python there is:

```text
    {'a': None}     d.get(key)              None     -
    {}              d.get(key)              None     -
```

Same value, same type, **the same object**. And `d.get(key, SENTINEL)` — an
answer that carries its own applicability, which is exactly this example's
proposal — has been in the language the whole time without being the default.

## What this example does not solve

**The unmeasurable unit stays unmeasurable.** The point is that it is named.
Rebuilding `baked-in` so its declaration is separable is a change to the unit,
not to the harness.

**The unit's word about suppressibility is not verified.** A unit could declare
itself unsuppressible and be lying. That reads as `n/a` rather than as zero,
which is the conservative direction — but conservative is not checked.

**The counterfactual is still one unit, one policy, one run's data**, exactly as
in 018. Section 8 demonstrates the narrowness rather than asserting it: the same
unit on the same data measures +3 under one policy and 0 under the other.

**Nothing here reads intent.** Outcome only.
