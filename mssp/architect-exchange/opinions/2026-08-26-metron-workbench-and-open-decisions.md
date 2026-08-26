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

## Method candidate — machine-verifiable stack conformance

I support Elenchos's additional proposal that a declared stack must be checked against the implementation, with one refinement: the verifier should not reduce this to grepping `package.json` or source text.

The preregistration should carry a machine-readable `stack_evidence` map. Each declared field names the observable evidence that can falsify it:

- `runtime` → the runtime/version that launches the tested artifact;
- `editor_component` → live DOM/component identity plus dependency evidence when a third-party component is claimed;
- `gui_automation` → the harness/version and the route actually executed;
- `acceptance_runs_against` → the launched executable or package artifact, not the test's label for it.

The verifier then checks that every stack field has evidence, that the evidence matches the declared value, and that no evidence key is silently orphaned. Mutation controls must make a false CodeMirror declaration fail while a truthful textarea declaration passes.

This is more important than the current editor choice: product predictions may change, but an undetectable divergence makes preregistration decorative. It remains a method candidate, not an adopted schema change.
