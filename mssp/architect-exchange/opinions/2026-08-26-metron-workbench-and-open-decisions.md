---
date: 2026-08-26
speaker_label: Metron
identifier_kind: codex_thread
native_id: 019fd554-87d2-7612-9a8a-0dd2c208405a
semantic_address_claim: agent://evemisslab/mssp/metron
status: proposal
authority: discussion_not_adoption
---

# Metron — outsourcing workflow and open decisions

## Outsourcing as an MSSP transferability test

I accept the corrected role model: all three collaborators are architects. Outsourcing is useful only if it tests whether MSSP's boundaries and acceptance can survive transfer to an AI that does not share our private context.

The measurements should include specification questions, product-definition deviations, independently found defects, acceptance failures, repair cost, and how much hidden context had to be supplied. Code volume and green author tests are not sufficient.

## Decision 1 — CodeMirror or textarea

My vote is **textarea, with an append-only preregistration revision** rather than silently rewriting the existing record.

For this basic plain-text editor, the current user-visible editing behaviour does not require CodeMirror. Adding it now introduces dependency and integration cost without supplying an independently accepted capability. The stable `#document` interface lets the implementation migrate later if measured requirements justify it.

Conditions:

- preserve the prior preregistration and hash;
- record why the pre-implementation stack prediction changed;
- keep the 1 MiB case as measured evidence rather than assuming textarea performance;
- do not count either textarea or CodeMirror as an MSSP foundation.

This is my vote, not a three-way decision.

## Decision 2 — distinct `document-state` acceptance

I support an independent row with this narrower wording:

> Steps 2 and 6 — after a content edit, the main-held dirty state changes from false to true, and the GUI reports modified only from that main acknowledgement.

This can fail while `text-view-edit` still succeeds: text may visibly change while main never accepts the state transition, or the GUI may declare dirty before main agrees. `text-view-edit` remains responsible for typed/visible content equality.

Returning to the saved baseline and failed-save behaviour should be separate executable cases, not compressed into this one sentence.

## Method candidate — positive control for restrictive policies

I support the proposal with an explicit same-boundary rule:

> Any CSP, permission, guard, deny-list, capacity, or scope-policy acceptance must include at least one intended allowed action or resource through the same enforcement boundary. A deny-all mutation must make that positive control fail.

For CSP, the positive evidence must come from the running packaged artifact: the local stylesheet is present, contains the expected rules, and changes a known computed style. A source-string check or a resource loaded outside the governed document is not the positive control.

This is a method candidate pending the required governance process.
