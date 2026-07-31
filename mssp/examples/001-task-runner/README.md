# 001 — Task Runner: when two TMS want to import each other

## What this program does

It takes a list of typed tasks, runs each one, and prints the outcome two ways:
a human-readable report and a JSON one. Tasks can read a file or fetch a URL.
Some are refused by policy. Nothing touches the network or the disk — the tools
are stubbed so the example runs anywhere.

```bash
node src/main.js
node src/island-test.js
```

## The structural decision

Both reporters need the same derived numbers: how long each task took, how many
passed, and which was slowest. Whichever reporter is written first naturally
grows a small summarise function, and the second one imports it:

```js
// TMS/reporters/json.js
import { summarise } from "./text.js";   // ← the line this example is about
```

That line works. It also does two things that are invisible on the day it is
written:

1. `json` can no longer be loaded without `text`. The island test for `json`
   silently becomes a test of both.
2. Deleting `text` breaks `json`, which has nothing to do with it.

This is the TMS-to-TMS dependency the method forbids (§7.3). The fix is not to
copy the function into both — that produces two summaries that drift apart. It
is to notice that the summary was never reporter-specific: it is a property of
the run.

So `runReport()` lives in `SMS/model.js`, computes `counts`, `totalMs`,
`passed`, and `slowest` once, and both reporters read those fields.

```
TMS/reporters/text  ──┐
                      ├──▶  SMS/model.js  (runReport)
TMS/reporters/json  ──┘
```

Neither reporter imports the other. `scripts/build-mssp.mjs` greps every example
for sibling-TMS imports and fails the build if one appears, so this does not
depend on anyone remembering.

## Set by set

**FMS** — `src/FMS/manifest.json`. What the system is, its non-goals, where each
capability lives, and the dependency rule. Nothing at runtime reads it; it
exists so a person or an agent can find a capability without loading it. No
procedure lives here, which is what keeps it from becoming a second monolith
(§15.4).

**SCL** — `src/SCL/permissions.{js,json}`. Per-type limits: a path prefix for
`file.read`, an allowed host list for `http.get`, outright denial for
`file.delete`. This is a set rather than a comment because a comment is an
expectation and a function is a contract (§15.5). Unknown types are denied by
default.

**SMS** — three modules, each failing the identity test if removed:

- `model.js` — the task result, the run report, and the two interfaces TMS bind
  to. Delete it and there is no shape for a handler to return or a reporter to
  read.
- `registry.js` — how TMS become present. Delete it and `main.js` must import
  every module directly, which makes "load exactly one TMS" impossible, which
  makes the island test impossible.
- `runner.js` — the loop. Delete it and the program is not a task runner.

**TMS** — four modules, each importing only from SMS: two handlers
(`file.read`, `http.get`) and two reporters (`text`, `json`). Any one can be
removed and the rest still run.

**DMS** — `src/DMS/trace.js`. Kept separate from the reporters because a
reporter renders the *result* while the trace records the *run*, including what
never became a result. `4 skipped` is a number; the human view is what says
which four and why.

There is no Router here. With one task type per handler, routing is a `Map`
lookup inside the registry, and a separate router would be an empty layer. It
appears when task selection stops being a lookup.

## A second decision the code makes

`runner.js` checks permission **before** capability. The reverse reads more
naturally — why consult policy about something you cannot do anyway? — and it is
what this example did first. It produced this line:

```
skipped wipe-data  no handler loaded for this type
```

True, and quietly wrong: `file.delete` is denied by policy, and the run reported
the loading state instead. The moment someone registers a delete handler, that
message changes meaning without anyone editing the policy. With the checks in
the right order it reads:

```
skipped wipe-data  denied: irreversible; no handler is loaded for it and policy denies it regardless
```

The general form: a policy answer that depends on which modules happen to be
loaded is not a policy answer.

## The island test

`src/island-test.js` builds a system with the minimal SMS and exactly one TMS,
stubs every tool, and asserts nothing else was loaded.

```bash
$ node src/island-test.js
island test: TMS/reporters/json, alone
  [OK]   only one TMS loaded
  [OK]   renders a report with no sibling TMS present
  [OK]   absent handler is a skip, not a crash
  [OK]   DMS explains the skip

island test: TMS/handlers/file-read, alone
  [OK]   runs with a stubbed tool and no reporter registered
  [OK]   SCL refuses the traversal path, and the core does the refusing

all island checks passed
```

The first block is the one that matters. If `json` still imported `text`, that
file would not even load — the failure is structural, not a wrong assertion.

## What this example does not solve

- **Scale marker.** 306 lines of code across 13 files. The five sets are here to
  make the parts visible; at this size two files would also do. To see what the
  structure actually buys, put the same boundaries on a project at the threshold
  described in [Start here](https://thisoneisneok.com/html/mssp/modules/start.html)
  — several roles, several tools, irreversible actions, sub-capabilities that
  need independent tests. This example demonstrates the shape, not the payoff.
- **The dependency rule is enforced by text matching, not by the language.**
  Static `import ... from` lines are checked. A dynamic `import()` built from a
  string would slip past it, as would a require built at runtime. A language with
  real module boundaries would not need the check at all.
- **That check was wrong when first written, and passed anyway.** It treated
  two files in the same category directory as internal to one module, so the
  exact import this example warns about did not trigger it. It was found by
  adding the forbidden line on purpose and noticing the build stayed green. A
  guard that has never been shown to fail is not yet evidence of anything.
- **One TMS per file is not the general case.** Real subsets have internal
  structure, and the boundary question gets harder when a TMS has its own
  submodules.
- **No Router, no versioning, no migration.** Three of the seven parts of a full
  MSSP-Scale system are simply absent here, and the example says so rather than
  implying they were handled.
