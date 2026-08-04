# 004 — Router: it returns a name, not a module

## What this program does

It decides which capability should handle a request — summarise this markdown,
validate that CSV — and then, separately and elsewhere, something loads what was
decided.

```bash
python src/main.py          # route four requests, then load only what was chosen
python src/island-test.py   # the router with the TMS directory removed from disk
```

This is the example the method's own notes put first. [開發區 缺點
3](/html/mssp/modules/development.html) says the Router has a definition —
$R(q,u,\tau,p) \rightarrow (S_q, T_q, C_q, D_q)$ — and no implementation
pattern, no scale guidance, and no account of how you would test one.

## The structural decision

**A Route names a capability. It does not hold one.**

That sounds like a preference until you try to island-test the router. A router
that returns modules has to import every candidate to be able to return any of
them, so:

- testing the routing logic requires loading everything it might select;
- the router holds a reference to every capability, which is the definition of
  not being a subset;
- and the on-demand loading that TMS exists for is defeated by the thing whose
  job was to enable it.

Returning an identifier costs one line at the call site and buys the island
test. Here is what that buys, concretely — section 1 of the island test renames
the entire `TMS/` directory off disk before it runs:

```console
== 1. the router, with no capability present at all
  PASS  routes with the TMS directory removed from disk - chose 'handlers/markdown'
  PASS  names a capability that has no file and never will - rule='ghost' …
  PASS  no TMS module was imported by routing - imported: []
```

The router decided about `handlers/does-not-exist`, correctly, while no such
file existed anywhere. A router returning modules cannot survive that line; one
returning names does not notice it happened.

The resolution step is four lines in `main.py`, and it is deliberately not in
the router:

```python
module = importlib.import_module("TMS." + route.capability.replace("/", "."))
```

`src/SMS/router.py` imports `sys`, `pathlib`, `SCL.policy` and `SMS.model`. Not
`importlib`, not anything under `TMS`. Section 5 checks that against the import
lines rather than the file text — the first version of that check grepped the
whole file for `TMS` and failed on the docstring sentence saying it imports
nothing from TMS, which is a check reading its own documentation.

### The second decision: a refusal ends the decision

`SCL` is consulted *before* a Route is returned, and a denied match does not
fall through to the next rule. Falling through looks harmless and lets a caller
reach a capability **by being denied a better-matching one** — which turns a
permission into a preference.

The island test covers both directions, because a section that passes by
refusing everything proves nothing: the actor denied the specific rule is also
shown reaching, by its own request, the capability it *is* permitted.

## Set by set

**FMS** — `manifest.json`, and the two decisions above with their reasons.

**SCL** — `policy.json` / `policy.py`. Which actor may use which capability.
`may_use` returns the reason as well as the verdict, which is what lets a Route
say *refused, and what was missing* — a caller that only learns "no" cannot tell
a missing permission from a missing rule.

**SMS** — `model.py` (Request, Route) and `router.py`. The router is core: remove
it and nothing can decide what to do with anything, so the loop does not close.
It is not a dispatcher — it never calls what it selects.

**TMS** — `handlers/markdown`, `handlers/csv`. Two units. Neither is imported
until a Route has already named it.

**DMS** — `ledger.py`. The decisions, and the two numbers below.

## The scale signal 缺點 3 asked for

"When does rule-based routing stop being enough?" has been a judgement call. Two
counts make it a measurement, and the router keeps them because a rule that
never fires produces no decision to count afterwards:

```text
  coverage
    rules             3
    never fired       image-thumbnail
                      the rule set carries weight it did not use
    unmatched         pdf/extract
                      requests arrived that no rule reaches
```

**Neither is an error.** A young rule set has unmatched requests because it is
young. An old one accumulates never-fired rules because the world moved on.
What matters is the direction over time — and there is no direction without a
number.

This is the same move as [example 003](/html/mssp/003-record-migration.html):
report what was *not* reached, as loudly as what failed. A router that only
reports its successful decisions is describing the requests it happened to
receive, not the rule set's fit to the requests that arrive.

## The island test

```console
$ python src/island-test.py
  ... 15 checks across 5 sections ...
  island test passed
```

Sections 3–5 exist because of [改良點 6](/html/mssp/modules/development.html).
Two of the three failures on the first run were **wrong premises in the test,
not defects in the code**: section 2 picked an actor that policy actually
permits, and section 5's grep read the docstring. Both are recorded here rather
than quietly fixed, because "the test was wrong" is the most common way a
check stops being a check, and it is invisible once repaired.

## What this example does not solve

- **It does not say when to switch to model-based routing.** It makes the input
  to that decision measurable and stops there. Two counts trending the wrong way
  tell you the rule set is losing fit; they do not tell you that a model would
  fit better, and nothing here would notice if a model fit worse.

- **`when=` is a lambda, so a rule is code.** Rules are data in the sense that
  the *set* is handed in, which is what the island test needs — but each
  predicate is arbitrary Python and cannot be serialised, diffed, or checked for
  overlap. A rule set you cannot compare against itself is one where two rules
  can silently claim the same request and only order decides, which is the
  problem [考古 002](/html/mssp/archaeology/002-http-server.html) hit from the
  other side.

- **Ordering is load-bearing and unstated.** First match wins. With three rules
  that is legible; the method gives no guidance on what to do when it is thirty,
  and "first match wins" is exactly the kind of rule that is obvious to whoever
  wrote the list and invisible to whoever inherits it.

- **Coverage is per-run.** The counts reset every process. Making the direction
  visible — the thing the whole section argues for — needs them persisted across
  runs, and this example does not do that. It demonstrates that the numbers
  exist, not that anyone is watching them.
