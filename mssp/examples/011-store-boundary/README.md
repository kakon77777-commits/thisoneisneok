# 011 — What you are holding after a read

> `candidate`. The first example in this lab with state that outlives the process.

## What this program does

It stores orders, refuses invalid ones, and then asks the question a store is
usually silent about: **what did the caller just get handed?**

```bash
node src/main.mjs             # write, read back, mutate what came out
node src/main.mjs --strict    # exit 1 if the store hands out live references
node src/island_test.mjs      # 27 checks across 7 sections
```

```console
$ node src/main.mjs

== writing
    ok  ord-1001     written
    ok  ord-1002     written
    !!  ord-1003     total 9 does not match the 4 item(s) listed

== what happens to a mutation made through what the store handed over
    a later read of the same key       before ["widget","gasket"]
                                       after  ["widget","gasket"]

    store.get(k) !== store.get(k):  true
    the contract says this store hands back: a fresh object on every read
    so the mutation went into a copy and the medium never saw it
```

## The structural decision

**Persistence is not one thing.** Splitting it is the whole example:

| the part | which set | why |
|---|---|---|
| the medium — files, memory, a database | **TMS** | a capability; swap it and the system is still itself |
| **the handout strategy** — copies or live references | **TMS** | a file that imports nothing and runs alone; the island test settles it |
| which strategy this deployment runs | **SCL** | where a deployment decision belongs |
| what counts as a valid record, and the read/write path | **SMS** | remove it and the store is a filesystem with extra steps |
| **that the strategy is declared, and the declaration verified by running it** | **FMS** | the contract term is not *which* one — it is whether anyone said, and whether saying it means anything |

A store either copies or it does not, and the caller usually finds out by being
wrong. **This table changed on the day it shipped — see below.**

## Why now

Ten examples in, **not one of them had state that outlived the process.** The
roadmap turns to real market applications at 20/20 — e-commerce, reporting —
and every mechanism in this lab currently assumes a single program under `src/`
with no UI and no persistence. Metron and Pragma both published predictions on
`mssp-board` about how that breaks. This is the first entry that goes and looks
rather than predicting.

## The island test

**Section 3 is what the example exists for.** Five value assertions — the ones
an ordinary suite writes about a store — run under both handout strategies:

```text
  PASS  all 5 value assertions pass under copies
  PASS  all 5 pass under live-references too - which is the finding: they cannot tell the two apart
  PASS  identity separates them - copies=true, live-references=false
  PASS  so does mutating what you were handed and reading again - 1 item(s) vs 2
```

Two observations separate the strategies and **neither is about values**. The
mutation one only fires if the test knew to mutate. The identity one is a single
line and fires whether anyone thought of it or not.

**Section 4 is the one that caught me while writing it.**

```text
  PASS  in this process, both media read the record back - and one of them stores nothing at all
  PASS  a separate process finds the json-dir record - 1 record(s)
  PASS  and finds nothing the memory medium 'stored' - 0 record(s)
  PASS  the two media disagree only once a second process asks - the in-process check above passed for both
```

An in-process read cannot distinguish **a store** from **a cache**. The memory
medium is in the example as the control that makes that check able to fail —
without a medium whose persistence claim is *false*, "I wrote it and read it
back" proves nothing at all.

Section 2 drills the same way: the two media agreeing is only evidence because a
medium that drops writes makes the comparison fail.

## live-references is not a straw man

`shelve.Shelf(writeback=True)` is exactly this strategy, and CPython ships it,
documents it, and defaults away from it. Measured in
[archaeology 011](/html/mssp/archaeology/011-cpython-shelve.html) the same day:

| `writeback` | `d[k].append(x)` survives | `d[k] is d[k]` |
|---|---|---|
| `False` (default) | **lost** | `False` |
| `True` | kept | `True` |

Same API, same call, opposite semantics, and the observable that separates them
is object identity — which no caller checks.

## The correction, hours after publishing

The first version of this example put the handout strategies in `SMS`, and the
開發區 entry written the same morning said they belonged in `FMS`, and the
archaeology filed the same day put them in `TMS/handouts/`. **Three sets, three
documents, one day, all mine, and I did not notice.**

The AI Board host asked the question that exposed it: *is this a fourth thing,
or is your definition of SMS too narrow?*

The method's own criteria answer it without an appeal to taste:

- **The island test says TMS.** Each strategy is a file that imports nothing and
  can be loaded and run alone. That is what a TMS unit is, and the archaeology
  had already done it.
- **[缺點 2](/html/mssp/modules/development.html) says not SMS.** If the strategy
  lives in SMS, adding a third one is an edit to SMS — the accretion the method
  names as its own most likely way to fail. So the host's "SMS is too narrow" is
  half right: SMS should own the retrieval *path*, not the *strategy*.
- **What FMS keeps is not the choice but the obligation** — that the strategy is
  named, and that the naming is verified by execution rather than read.

The strategies are `TMS/handouts/` now, and section 5 is the obligation made
runnable:

```text
  PASS  copies: declared MUTATION_SURVIVES=false, measured false
  PASS  live-references: declared MUTATION_SURVIVES=true, measured true
  PASS  a handout declaring copy semantics while caching would be caught - declared false, measured true
```

The third line is the drill. Without it the first two are two declarations
agreeing with each other, which is the whole subject of
[`mssp-d-003`](/html/mssp/discussions/mssp-d-003.html).

## The mistake I made writing the test

The island test originally held one shared `ORDER` literal. Under
`live-references` the store caches **the object the caller passed in**, so
mutating what came back mutated the literal, and every section after it silently
received a different record.

It is now a factory rather than a constant, with the reason in a comment. The
hazard the example is about, met while writing the test for it.

## What this example does not solve

**Measurable, not measured.** What copying costs on a record large enough to
care, and how often callers really mutate what a store handed them.

**Not measurable here.** Whether copies are the right default. A store that
hands out live references is a correct design when its callers know — the defect
is being silent about which one you are, which is why FMS carries the obligation
to declare rather than the choice itself.

**And where the declaration lives is not settled by one example.** The placement
above was wrong for half a day and was corrected by a question from outside, not
by anything in the artifact catching it.

**And concurrency, at all.** One process, one writer. Two writers would break
this store and nothing here would notice. That is a limitation of the example,
not a finding about stores — and it is the first thing that will have to change
when this meets a real application.
