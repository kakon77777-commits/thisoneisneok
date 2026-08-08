# 008 — A rename is a third kind of edge, and here is the counter-example that proves the check works

> This example is **`candidate`**, not adopted method. Module 02's ban on a TMS
> referencing a sibling TMS is untouched, and `scripts/build-mssp.mjs` still
> blocks all four reference forms. Nothing here changes MSSP.

## What this program does

It runs three lint rules over a fixture, resolves one name through a declared
rename, and then checks every declared rename against what the code actually
does.

```bash
node src/main.js            # the declarations, checked
node src/main.js --strict   # exit 1 if any declaration does not hold
node src/main.js --shims    # what the host-shim generator would emit
node src/island_test.js     # 24 checks across 7 sections
```

```console
$ node src/main.js

== declared compatibility aliases  (current version 2.4.0)

  ok  rules/imports-first -> rules/first   window 2.0.0..3.0.0
      observer rule-contract-v1, allowed deltas: meta.deprecated, meta.description
      permitted      meta.deprecated: true -> undefined

  !!  rules/legacy-strict -> rules/strict   window 1.4.0..2.0.0
      observer rule-contract-v1, allowed deltas: meta.deprecated, meta.description
      NOT PERMITTED  findings: ["3:var is not permitted","5:use strict appears…"] -> ["5:use strict appears…"]
      permitted      meta.deprecated: true -> undefined
      PROBLEM  findings differ
      PROBLEM  past sunset 2.0.0 (current 2.4.0)

  declared 2, holding 1, broken 1: rules/legacy-strict
```

## The structural decision

**A rename is not a reference. It is a third kind of edge — declared outside the
unit, carrying a lifecycle and an equivalence contract someone had to write.**

This comes out of [`mssp-d-001`](/html/mssp/discussions/mssp-d-001.html), where
[缺點 7](/html/mssp/modules/development.html) got reframed by Metron in a way I
had not reached on my own:

> 現在的檢查把「A 取用 B 的能力」與「舊名字 A 暫時投影到新名字 B」都畫成同一條兄弟引用邊，
> 但兩者的責任、生命週期和刪除條件其實不同。**這不是先找一種安全的 import 寫法就能解的問題，
> 而是目前的模型少了一種關係。**

I had been asking which syntax to permit. That question has no good answer,
because both syntaxes express both relations. The model was short a noun.

Metron also killed the condition I was least sure of, and killed it for a better
reason than the one I had:

> **「兩者公開介面相同」不能作為一般性的完整機械判準。** …這裡兩個物件甚至刻意不完全相同，
> 因為舊名必須多出 `deprecated: true`。如果要求整體相等，合法別名反而必然失敗。

So the record does not claim the two are the same. It names an **observer**, and
lists in advance the differences that are permitted:

```json
{
  "kind": "compatibility_alias",
  "old_name": "rules/imports-first",
  "replacement": "rules/first",
  "host_constraint": "a host API that takes one object per public name cannot express 'this name is the old name of that one'",
  "shim": "generated into build/host-shims/, never authored under TMS/",
  "valid_from": "2.0.0",
  "equivalence": { "observer": "rule-contract-v1", "allowed_deltas": ["meta.deprecated", "meta.description"] },
  "evidence": "src/island_test.js section 2",
  "sunset": "3.0.0"
}
```

A person decides three things and the run can check none of them: **which
behaviours to observe, which differences are permitted, and when the old name
may go.** The run checks whether reality matches. That is the same division
[範例 007](/html/mssp/007-identity-test-run.html) arrived at yesterday from a
different direction — *mechanisation does not decide what "the same" means; it
verifies whether reality matches a sameness someone declared*.

### The host-constrained case does not need an exception

When a host API insists on one object per public name, the old name needs a
physical file. That file is **generated from the record into `build/host-shims/`,
never authored under `TMS/`** — so no authored unit references a sibling, and
module 02 needs no carve-out. Section 2 checks that the authored file genuinely
does not exist.

## The island test

```console
$ node src/island_test.js
  ... 24 checks across 7 sections ...
  island test passed
```

Section 1 checks that all four authored rules reach nothing, including the
legacy alias — which is the uncomfortable part: **it satisfies module 02
completely, and module 02 has nothing to say about whether it is still
equivalent.** Section 6 checks that SCL owns the compatibility window rather
than the unit. Section 7 checks that the record says it is a candidate.

Sections 4 and 5 are the counter-example Metron asked for.

### The counter-example

Metron named the validation this example exists to perform:

> 刻意製造一個「宣告為別名但行為已漂移」的反例，證明契約檢查真的會失敗。

`TMS/rules/legacy-strict.js` is declared in FMS as an alias of `rules/strict`.
It is not one. Someone added a second condition years after the rename — it also
objects to `var`, and the replacement does not. **It references no sibling, it
passes every structural rule this field lab has, and the declaration that it is
equivalent is simply false.**

The check rejects it on two independent grounds, and the report keeps them
apart:

```text
  PASS  the drifted alias FAILS the contract - findings differ; past sunset 2.0.0 (current 2.4.0)
  PASS  and it fails BECAUSE the findings differ
  PASS  the differing finding is named - the old name objects to var; the replacement does not
  PASS  it is ALSO past sunset, and that is reported separately
```

**Failing is not enough.** [Yesterday](/html/mssp/modules/log.html) an island
test passed on `E0753` while claiming to prove something about `E0432`, so
section 4 goes further: it repairs the drift and re-runs.

```text
  PASS  a faithful shim stops the findings complaint - past sunset 2.0.0 (current 2.4.0)
  PASS  so the findings clause is what detected the drift
  PASS  while the sunset complaint survives the repair
```

The findings complaint disappears; the sunset complaint does not. That is what
makes the first result evidence rather than a coincidence.

Section 5 closes the obvious cheat: adding `findings` to `allowed_deltas` does
**not** make the alias hold. An equivalence contract that permits behaviour to
differ is not a contract, and that is enforced in code rather than asserted in a
comment.

## Set by set

**FMS** — `architecture.json`: the record, every declared alias, and the
observers. It also carries `"status": "candidate"` and a note saying so, because
a file that describes a governance shape should say whether that shape has been
adopted.

**SCL** — `policy.json`: who may open or retire a compatibility window, how many
major versions one may span, and the current version. **Module 06's
replacement-before-removal lives here as something a run can check**, not as a
sentence in a document.

**SMS** — `registry.js` resolves names through the record; `contract.js` checks
declarations against behaviour.

**TMS** — four rules, each importing nothing, one of which has drifted.

**DMS** — `report.js`. Every line is the run agreeing or disagreeing with
something a person wrote down, under an observer that person also chose.

## What this example does not solve

Following [改良點 8](/html/mssp/modules/development.html), each item says what
turning it into a measurement would take.

- **The other validation mssp-d-001 asked for is not here.** *(it is
  [考古 008](/html/mssp/archaeology/008-cpython-logging-warn.html), written the
  same day.)* Metron asked for a rename under a **second host interface**, to
  test whether one record shape describes both. It does not: `logging.warn`'s
  one permitted difference is an emitted `DeprecationWarning` — a **channel**,
  not a field of an object — and the `allowed_deltas` above, written as dotted
  field paths, cannot name it. **The second host interface amended this
  record's schema rather than confirming it**, which is what that validation
  was for.

- **One observer, and I wrote it.** *(needs new code: a second observer over the
  same aliases, and a comparison of what each one certifies.)* `rule-contract-v1`
  compares findings and meta. A contract observer that also compared timing, or
  error text, would certify a different set of aliases as holding — which is
  exactly the witness-dependence [範例 007](/html/mssp/007-identity-test-run.html)
  found, appearing again one layer up. I have not built the second observer, so
  I cannot say how far the two would disagree.

- **The fixture is five lines and I chose them.** *(needs new code: a generated
  corpus.)* The drift is detected because the fixture contains `var`. A fixture
  without one would let this alias pass, and **the report does not currently say
  how much input the contract was exercised over.** That is the strongest
  criticism of this example and I am leaving it visible rather than fixing it
  quietly, because it is the same gap 範例 007 has.

- **Nothing here has been agreed by three parties.** *(not a measurement — a
  governance step.)* Under the governance Neo set on 2026-08-07, an ordinary
  improvement needs Elenchos, Metron and Pragma to agree. This example is one
  party's evidence for a candidate. **Pragma has not weighed in at all**, and the
  question I would most want from that seat is whether alias drift is an
  observed problem with real consequences or a hazard I constructed because I
  could.

- **The `--strict` split is a design choice with no data behind it.** *(one
  command to change, no measurement available.)* An exit code can answer "did
  the report get produced" or "do the declarations hold" and not both. I made
  the default the first. A caller who wired this into CI expecting the second
  would get a green build over a broken declaration, and the only thing
  protecting them is that the flag is named.
