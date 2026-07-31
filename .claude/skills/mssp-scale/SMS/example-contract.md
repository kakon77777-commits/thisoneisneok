# Example contract

Every example under `mssp/examples/` obeys this. `scripts/build-mssp.mjs`
enforces it and fails the build rather than publishing a broken entry.

## Directory

```text
mssp/examples/NNN-slug/
├── meta.yaml          required
├── README.md          required — the walkthrough
└── src/               required — the actual code, organised by set
    ├── FMS/
    ├── SCL/
    ├── SMS/
    ├── TMS/
    └── DMS/
```

`NNN` is a zero-padded ordinal fixed at creation and never reused. `slug` is
lowercase ASCII with hyphens; it becomes the URL.

Only create the set directories the example actually uses. An empty `TMS/`
teaches nothing, and the build rejects an empty set directory for exactly that
reason.

## meta.yaml

```yaml
id: 001-task-runner          # must equal the directory name
title:
  zh: 任務執行器
  en: Task Runner
summary:
  zh: 一句話說明這個範例示範了什麼結構決策
  en: One sentence on the structural decision this example demonstrates
language: javascript          # the example's implementation language
date: 2026-07-31              # ISO, the day it was written
version: v1.0
kind: example                 # example | counterexample
concepts:                     # which parts of the method this exercises
  - sms-vs-tms
  - island-test
runnable: node src/main.js    # the exact command, or omit if not runnable
```

`kind: counterexample` marks an example that deliberately shows the wrong
structure. The site renders those with a warning so nobody copies one by
mistake.

## README.md

Written for a reader who knows how to program and has not read the MSSP papers.
Required sections, in order:

1. **What this program does** — the problem, in plain terms, before any theory.
2. **The structural decision** — the specific call this example exists to show.
   One decision per example. An example demonstrating four things demonstrates
   none.
3. **Set by set** — for each set present, what is in it and why it is there.
   State which sets are absent and why.
4. **The island test** — which TMS was tested alone, with what minimal core, and
   what the result was. Include the command.
5. **What this example does not solve** — the honest limits. Every example has
   them, and hiding them is how a method turns into a sales pitch.

## What counts as one TMS unit

The build enforces "no TMS imports a sibling TMS", so the unit boundary has to
be unambiguous:

> A **TMS unit** is a directory under `TMS/` containing an index file, or
> otherwise a single file.

So `TMS/reporters/text.js` and `TMS/reporters/json.js` are **two units** that
happen to share a category directory, and an import between them is a violation.
`TMS/adapters/github/index.js` and `TMS/adapters/github/lib/http.js` are **one
unit**, and may import each other freely.

Category directories (`handlers/`, `reporters/`, `adapters/`) are for human
navigation. They are not units and grant no import privileges.

## Code rules

- The example must actually run. `runnable` is executed by the build, and a
  non-zero exit fails it.
- No dependencies beyond the standard library of its language. A reader should
  be able to copy the directory and run it.
- Small enough to read in one sitting. If it is growing past roughly 400 lines
  across all sets, the example is trying to demonstrate too much.
- Comments explain *why the boundary is here*, not what the line does.

## One example, one decision

The daily cadence works only if each entry is small and sharp. Good subjects:

- promoting a capability from TMS to SMS, and what broke
- two TMS that wanted to import each other, and the SMS contract that fixed it
- an SCL permission that a runtime can actually check
- a DMS view that turns a successful run into something a human can verify
- the same program before and after, with the coupling measured

Bad subjects: "MSSP applied to X" with no specific decision, or a rewrite of a
large framework.
