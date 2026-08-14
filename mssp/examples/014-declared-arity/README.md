# 014 — When a field can hold more than one value, "read the value" is not a question

> `candidate`. The last assumption this lab had never touched: a request arriving from outside it.

## What this program does

It reads one query string four fields at a time, with three readers, and only
one of them can come back empty-handed.

```bash
node src/main.mjs             # what SCL runs, and what the other readers said
node src/main.mjs --strict    # exit 1 when the configured reader refuses
node src/island_test.mjs      # 23 checks across 6 sections
```

```console
  q=mssp&page=2&page=3&tag=structure&tag=evidence&sort=date

  field   declared       got   declared-arity                first-wins        last-wins
  q       optional-one   1     "mssp"                        "mssp"            "mssp"
  page    one            2     REFUSED (declared one, got 2) "2"               "3"
  tag     many           2     ["structure","evidence"]      "structure"       "evidence"
  sort    one            1     "date"                        "date"            "date"
```

## The structural decision

**Arity is a term of the contract, checked at the read — not something decided
by whichever accessor the caller happened to reach for.**

`page` arrived twice. `first-wins` says `"2"`, `last-wins` says `"3"`, and
**neither says a choice was made.** They are not two implementations of one rule;
they are two rules with the same call shape. Only a reader that knows `page` was
declared `one` can tell a repeated checkbox from a repeated mistake.

## Why now

Six days from the switch to real market applications. Persistence was
[011](/html/mssp/011-store-boundary.html) and [012](/html/mssp/012-two-writers.html);
this is the other thing every entry so far has assumed away — **input arriving
from outside the program**, where the sender is not the author and repetition is
a normal thing for a browser to do.

## The island test

Section 2 is what the example exists for:

```text
  PASS  the request carries `page` twice
  PASS  first-wins and last-wins disagree about which one is the value - "2" vs "3"
  PASS  and neither of them reports that it chose
  PASS  they agree on every field that carries exactly one value
```

The last line matters: the disagreement is **about multiplicity, not about
parsing**. Both readers see the same three values; they differ only in which one
they call "the" one.

Section 4 covers absence, which is a different question from multiplicity:
`optional-one` absent is `null`, `many` absent is `[]`, and `one` absent is
refused — three different right answers that a single "return null if missing"
would have collapsed.

Section 3b is the drill: a reader declaring `REFUSES = true` that never refuses
must be caught, or section 3 is a label agreeing with a label.

## live from upstream

[Archaeology 014](/html/mssp/archaeology/014-urlsearchparams.html), measured the
same day, is where this decision is actually made in production JavaScript:

| read | keeps |
|---|---|
| `params.get("tag")` | the **first** |
| `Object.fromEntries(params).tag` | the **last** |
| `params.getAll("tag")` | all of them |

`first-wins` and `last-wins` in `TMS/readers/` are those two, and they are in the
example because they are what the platform hands you, not because I invented a
bad option to knock down.

## What this example does not solve

**Measurable, not measured.** How often a repeated key in a real request is
accident rather than design, and what refusing costs a caller who was relying on
`first-wins`.

**Not measurable here.** Whether refusing is the right policy — coercing,
clamping and taking the last are all defensible, and **choosing one without
saying so is the only thing this example takes a position against.** And whether
a declared arity is correct: someone wrote `page: one`, and nothing here can tell
a wrong declaration from a wrong request.
