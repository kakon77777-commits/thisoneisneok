---
name: mssp-scale
description: Author and review MSSP (Mother-Set and Subset Paradigm) examples for the thisoneisneok.com MSSP field lab. Use when adding a daily MSSP programming-language example, restructuring code into FMS/SCL/SMS/TMS/DMS, judging whether a capability belongs in SMS or TMS, running an island test, or reviewing an existing example for hidden coupling. Also use when the request mentions MSSP, 母集與子集, FMS, SMS, TMS, SCL, DMS, or "capability module".
---

# MSSP-Scale

This skill is itself organised as MSSP. This file is the FMS and the Router: it
says what exists and which subset to load. It carries no procedure of its own.

Source of truth for the method: `D:\我的研究\學術討論\論文\AI大語言模型實作\母集與子集範式：下一代程式語言架構的理論與實踐\01-mssp-scale-skill.md`
(Neo.K, MSSP-Scale Skill v0.1, 2026-07-12). Read it when the task turns on the
theory rather than on producing an example.

## Non-goals

- Not a folder-naming convention. Splitting files without breaking coupling is
  the "pseudo-modularity" anti-pattern (§15.2), and it is the most common way
  MSSP gets applied wrongly.
- Not a mandate to structure everything. Below the size thresholds in
  `SMS/scale-thresholds.md`, staying simple **is** the correct application.
- Not a way to add papers to the site. Papers are a separate pipeline.

## Router

| Task | Load |
|---|---|
| Add a daily MSSP example | `SMS/example-contract.md`, then `SMS/decomposition.md` |
| Decide SMS vs TMS for a capability | `SMS/decomposition.md` |
| Decide whether to apply MSSP at all | `SMS/scale-thresholds.md` |
| Review an example before publishing | `DMS/review-checklist.md` |
| Raise, continue, or answer an implementation discussion | `mssp/discussions/README.md` |
| Language-specific idioms | `TMS/languages/<language>.md` |
| What may be changed, and by whom | `SCL/permissions.policy.yaml` |

Load the smallest set that answers the task. Loading all of the above for a task
that needs one of them is the failure this method exists to prevent (§1.2.1).

## The five sets, in one line each

- **FMS** — what the system is, why it exists, where things are. Pure metadata,
  no executable logic.
- **SCL** — what may be changed, by whom, at which risk level. Knowledge and
  permission are separate concerns (§5.2).
- **SMS** — capabilities whose removal ends the system's identity.
- **TMS** — capabilities that load on demand, swap out, and test alone.
- **DMS** — what a human can see about what actually happened.

## The two questions that decide everything

1. If this capability is removed, does the system still close its core task loop?
   No → SMS. Yes → TMS.
2. Can it be tested with only the minimal core loaded and the other TMS absent?
   No → it has hidden coupling, and it is not yet a TMS.

## Workflow: adding a daily example

1. Read `SMS/example-contract.md` for the directory and metadata contract.
2. Write the example under `mssp/examples/NNN-slug/`.
3. Run the island test in `DMS/review-checklist.md`. An example that cannot pass
   it demonstrates the anti-pattern, not the method — either fix it or label it
   explicitly as a counterexample.
4. `node scripts/build-mssp.mjs` from the repo root.
5. The build fails if the contract is violated. Do not work around it by editing
   the check.

Counterexamples are welcome as examples, but they must be marked
`kind: counterexample` so a reader is never left copying a broken structure.

## Collaboration desk

Implementation questions and improvement ideas that need a reply from the MSSP
collaborator go in `mssp/discussions/`, one Markdown file per thread. Codex is
the discussion manager. Follow that directory's `README.md`: append messages,
keep evidence and uncertainty visible, and do not present a discussion answer
as an authorised method change. A conclusion only becomes method state after it
is promoted to the development notes, log, authority, an example, or an
archaeology entry by the appropriate authority.
