# 002 — Link checker: promoting a TMS to SMS, and paying for it

## What this program does

It reads a couple of documentation pages, pulls every link out of them, and says
which ones are reachable. Two kinds of link, two different jobs: an absolute URL
has to be fetched from a host, and an in-page `#fragment` only has to be matched
against the headings of the page it sits on.

```bash
python src/main.py                    # the structure as published
python src/main.py --without-pacing   # the evidence the promotion rests on
python src/island-test.py             # each TMS alone, plus a check that the SCL rule can fail
```

The network is stubbed and the clock is fake, so a run is instant, offline and
deterministic. Nothing here depends on anything outside the standard library.

## The structural decision

**A capability was declared optional. It turned out the main loop could not
finish without it. So it moved into SMS — and the move cost something, to a
module that had nothing to do with it.**

`pacing` — waiting a moment between requests to the same host — started as
`TMS/pacing`. That is the obvious place for it. It is a courtesy, it is the kind
of thing you switch off in tests, and nothing about "check some links" sounds
like it requires politeness.

The first sign of trouble was mechanical. `TMS/checkers/http` imported
`TMS/pacing`, and the build rejects a TMS that imports a sibling TMS. The
tempting fix is to make the check pass: move `pacing` into `SMS/` and carry on.

That fix is right by accident, which is not the same as right. The question the
method actually asks is:

> If this capability is removed, is the system still the system it was?

So remove it and look:

```console
$ python src/main.py --without-pacing
  ok   index.md -> https://docs.example.com/setup  (HTTP 200)
  FAIL index.md -> https://docs.example.com/config  (HTTP 429)
  FAIL index.md -> https://docs.example.com/tuning  (HTTP 429)
  …
  5 checked, 3 failed, 3 left without a verdict
  loop closed: False
```

Three links never got a verdict at all. A link checker that is slow is still a
link checker; a link checker that leaves links unchecked is not doing the one
thing it exists to do. **The loop cannot close without pacing, so pacing is
core.** Not because it is used often — because removing it ends the identity.

That is the promotion. The interesting half is what it broke.

### What broke

The tidiest shape after moving `pacing` into SMS is for `SMS/pipeline` to call
it once per link, before dispatching to a checker. One call site, no checker has
to remember anything, and it reads beautifully.

It also charges the wait to whichever capability happens to be next in the list.
`checkers/anchor` never opens a connection — it reads headings out of a string
already in memory — and it started paying a delay for a resource it does not
touch. Nothing failed. The report looked the same. The only visible difference
was a number:

```text
  pacing waits by capability:
    checkers/http        1   (network)
    checkers/anchor      2   (no network)     ← paying for someone else's host
```

This is the trap the method names directly: *everything becomes SMS*. A
capability promoted into the core does not stop at the module that needed it —
it reaches every module the core touches, including the ones that were fine.

The fix is that `pace()` is called by the capability that is about to open the
connection, not by the pipeline. `SMS/pacing` decides nothing about who should
wait; it asks the link, and `Link.host` is `None` for anything that never leaves
the page.

And because "the anchor checker should not pay for this" is exactly the kind of
intention that quietly stops being true, it is written down where something can
check it — `SCL/policy.json`, rule `pace-requires-network`, enforced at the end
of every run. Section 4 of the island test builds the wrong shape on purpose and
requires the rule to reject it.

## Set by set

**FMS** — `manifest.json`. What the program is, what each capability does, and
decision `D-001` recording the promotion with its reason and its cost. No
executable procedure.

**SCL** — `policy.json` says which capability may reach the network, may wait,
and may fail the run; `policy.py` is the part a runtime calls. The separation
matters here in a concrete way: `checkers/anchor` knows perfectly well how to
resolve a fragment and holds `network: false`, and *that fact* is what makes
"should it ever wait?" answerable by a check instead of by an opinion.

**SMS** — `model.py` (the shapes everyone agrees on), `pacing.py` (promoted
2026-08-02), `pipeline.py` (the loop). The pipeline knows checkers only by the
interface declared in it and imports none of them.

**TMS** — `checkers/http`, `checkers/anchor`, `reporters/text`. Three units,
each loadable alone. `http` and `anchor` share the category directory
`checkers/`; that is for human navigation and grants them nothing — an import
between them would be a violation exactly as if they sat in different folders.

**DMS** — `trace.py`. Events, and the waits-per-capability table that makes the
cost of the promotion a number rather than a claim.

No set is absent. At this size that is unusual and worth saying plainly: see the
last section.

## The island test

```console
$ python src/island-test.py

== 1. each TMS alone, minimal core, no sibling loaded
  PASS  checkers/anchor runs with no other checker loaded - 2 verdict(s), 2 link(s) left to the absent http checker
  PASS  checkers/anchor incurred no pacing wait - waits=0
  PASS  the loop reports the links it could not cover - unchecked links are recorded rather than silently dropped
  PASS  checkers/http runs with no other checker loaded - 2 verdict(s)
  PASS  checkers/http paced itself - waits=1

== 2. no TMS imports a sibling TMS
  PASS  no sibling TMS import - 3 unit(s) scanned

== 3. what the promotion did to 'minimal core'
  PASS  pacing is part of the minimal core now - SMS = model.py, pacing.py, pipeline.py - before 2026-08-02 this was model.py, pipeline.py

== 4. the SCL rule can fail
  PASS  SCL rejects a network-free capability that waited - SCL rule 'pace-requires-network' violated: checkers/anchor waited 1x with netw…
  PASS  SCL accepts the published shape

  island test passed
```

Section 3 is the honest accounting: the minimal core needed to exercise one TMS
alone is now larger than it was yesterday. That is what a promotion costs, and
it is permanent.

Section 4 exists because `assert_pacing_is_earned` passes every ordinary run, so
by itself it is indistinguishable from a function that returns `None`. A guard
nobody has watched fail is not yet a guard.

## What this example does not solve

- **The promotion is easy here because the evidence is one command away.** Real
  systems find out that a capability was load-bearing during an incident, months
  after someone marked it optional, and by then several modules have been built
  on the assumption that it can be switched off. Nothing in MSSP makes that
  discovery arrive earlier. The method gives you a place to record the answer
  once you have it.

- **Nothing here re-asks the question later.** `D-001` says pacing is core as of
  2026-08-02. If the transport is replaced next year by one that does its own
  throttling, pacing stops being constitutive and should be demoted — and no
  part of this example would notice. Demotion is the expensive direction, which
  is precisely why nobody does it.

- **`Link.host` is doing quiet structural work.** The reason the promotion did
  not spread is that a link can say whether contacting anyone is involved. If
  that fact had lived in the checker instead of the model, `pace()` would have
  needed to know which checker was calling, and the core would have grown a
  dependency on its own subsets. That worked out; it was not forced by anything
  in the method.

- **At this size the structure is a net cost, and the numbers say so.** The five
  sets are 467 lines, of which 331 are code and the rest are comments explaining
  where the boundaries are. `main.py` and `island-test.py` add another 251 —
  more than half the program exists to demonstrate and verify the program. As
  one file this would be perhaps 120 lines and a reader could hold all of it at
  once. Five directories, a policy file and an interface protocol are not paying
  for themselves here.

  What the size buys is that the promotion is *visible*. In a single file,
  moving `pace()` from the dispatch loop into the caller is moving a line eighty
  rows up, and nobody would have asked what it cost — there would have been no
  boundary for it to cross. Read this as a demonstration of one decision, not as
  a recommendation for programs this small. The method's own scale guidance puts
  the threshold well above this, and this example sits under all of it.
