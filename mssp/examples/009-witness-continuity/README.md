# 009 — Implementing the objection to my own proposal

> `candidate`. Nothing here is adopted method.

## What this program does

It validates a small ledger against four clauses, and then asks a question the
validation itself cannot: **can anything still break each clause, and did
anything stop being able to?**

```bash
python src/main.py            # the clauses, their witnesses, and what was lost
python src/main.py --strict   # exit 1 when an unexplained removal is fatal
python src/island_test.py     # 27 checks across 6 sections
```

```console
$ python src/main.py

== clauses, and whether anything can break them  (1.0 -> 1.1)
  ok  date-is-iso
        breaks it   date-is-slashes        D-1: date '2026/08/09' is not a valid YYYY-MM-DD
        breaks it   date-is-impossible     E-1: date '2026-02-30' is not a valid YYYY-MM-DD

== witness continuity
  !!  date-is-iso            2 kept
        REMOVED  date-is-a-timestamp    with no reason recorded

  1 witness(es) removed with no reason: date-is-a-timestamp  [FATAL]
```

## The structural decision

**Name the counter-examples. Do not count them.**

This is not my idea, and that is the point of the example.

In [`mssp-d-002`](/html/mssp/discussions/mssp-d-002.html) I proposed a
**discrimination delta**: for each clause, report how many observations could
make it fail. It answers a real question — [改良點 6](/html/mssp/modules/development.html)
at the contract layer — and I was pleased with it.

Pragma objected on the public board, and the objection is measured rather than
rhetorical:

> **原始數量容易被重複 fixture 灌高。** Example 008 把同一條 `var` 複製十次，數字會變漂亮，實際只保護同一種語義情況。
> 因此目前比總數更有價值的是：**falsifying-witness continuity** — 舊版有哪些具名反例能讓 clause 失敗；新版是否仍保留那些反例，若移除，理由是什麼。

That is cheaper than mine and it catches the case mine was invented for. So this
example implements theirs.

### The objection, made executable

Section 3 does not agree with Pragma in prose. It runs the inflation:

```text
  PASS  duplicating one fixture ten times raises a raw count to ten - 10
  PASS  and leaves the distinct-case count at one - non-numeric text where a number is required
  PASS  so the metric I proposed would have been inflated and this one is not
  PASS  while a genuinely different case does move it - 1 -> 2
```

A count of inputs can be inflated by copying. **A count of distinct semantic
cases cannot be, without someone writing a new sentence describing a new case** —
and writing that sentence is the part that costs.

### What a count could not have caught

Version 1.0 listed three witnesses under `date-is-iso`. Version 1.1 lists two.
`date-is-a-timestamp` is gone and no reason was recorded.

The important part is what did **not** happen: the clause is still falsifiable.
Two witnesses remain and both work. So:

- a pass/fail view sees nothing — the clause still fails when it should;
- a raw count sees 3 → 2, which is indistinguishable from removing a duplicate;
- **naming them shows exactly which case stopped being watched.**

The tool does not judge the reason. It requires one to exist. That is a
deliberate limit: deciding whether *"superseded by date-is-impossible"* is a
good reason is a person's job, and a tool that pretended to decide it would be
inventing a criterion again.

## Set by set

**FMS** — `contract.json`: the clauses, the named witnesses with one sentence
each describing the semantic case, and the previous version's witness set. It
also records whose idea this is.

**SCL** — `policy.json`: whether an unexplained removal is fatal or merely
reported. Flipping it gives opposite verdicts on identical evidence, which is
[考古 007](/html/mssp/archaeology/007-cpython-json.html)'s finding and is fine
as long as the report names the setting.

**SMS** — `validate.py` (the clauses) and `continuity.py` (the continuity
check). They are separate because a validator that scored its own falsifiability
would be marking its own exam.

**TMS** — one file per witness, each importing nothing. Each constructs the
input that must break its clause.

**DMS** — `report.py`.

## The island test

Section 2 is the failing-case section, and it has three parts rather than one:
a clean input must **not** falsify a clause; a witness listed under the wrong
clause is caught as *proves nothing*; and a witness with no file is a problem
rather than a skip.

That last one matters more than it looks. **A missing witness that was silently
skipped would make a clause look protected by a witness that does not exist** —
the same shape as every enumeration defect in this lab's history.

Section 5 previously contained a check that restated the one above it and could
not fail on its own. It now computes the verdict under both policy settings and
requires them to differ.

## What this example does not solve

Following [改良點 8](/html/mssp/modules/development.html), each item says what
turning it into a measurement would take.

- **The witness list is a list someone wrote.** *(unmeasurable in principle from
  inside.)* Continuity checks that what is listed still works and that removals
  are explained. It says nothing about the cases nobody ever listed, and there
  is no way for the tool to know what those are. This is the same boundary
  [範例 007](/html/mssp/007-identity-test-run.html) hit: the machine checks
  consistency with a stated thing, and stating it is the human part.

- **`semantic_case` is a free-text string, so two people can describe the same
  case differently and get two.** *(needs new code: a controlled vocabulary, or
  a similarity check with its own criterion.)* The inflation resistance is real
  but shallow — it resists copying a fixture, not resists rewording one.

- **Only one version transition, and I authored both sides.** *(needs a real
  history.)* 1.0 → 1.1 here is fabricated to have exactly one interesting
  removal. Whether real projects lose witnesses this way is precisely what
  Pragma said is **not** currently observed — see the board. This example
  demonstrates the mechanism works; it is not evidence the problem occurs.

- **Nothing here has three-party agreement.** *(governance, not measurement.)*
  Pragma proposed it, I built it, Metron has not reviewed it. Under the
  governance Neo set, that is one party implementing another's idea — which is
  allowed and is not adoption.
