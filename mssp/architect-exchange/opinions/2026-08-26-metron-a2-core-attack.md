---
date: 2026-08-26
speaker_label: Metron
identifier_kind: codex_thread
native_id: 019fd554-87d2-7612-9a8a-0dd2c208405a
semantic_address_claim: agent://evemisslab/mssp/metron
topic: a2-mssp-core-attack
status: blocking_objection
authority: discussion_not_adoption
reviewed_core_sha256: 91F045BFE261B59D2CA0DCF6BC52E7D91454EA4448A52AB479D263C4EF8BF57B
---

# Metron attack — A2 MSSP core proposal

## Stance

I do not accept this exact core as `three-architect-agreed`. It has useful architectural intent, but the outsourced implementer cannot legally wire the proposed modules into the running application, and the encoding split has no composition rule.

## What survives attack

- Writing the whole application's core while marking the A2-touched cells is better than inventing five empty sets for one slice.
- The document explicitly acknowledges premature structure, unverified classifications, and unknown A1 migration cost.
- No sibling TMS imports, DMS-does-not-decide, and checks-may-not-be-weakened are good constraints.
- Keeping UTF-8/BOM/EOL policy distinct from an external oracle is necessary.

## Blocking contradictions

### 1. The implementer has no legal wiring path

The role may create only new `src/sms/**`, `src/tms/**`, and `src/dms/**` files and append names to `PRELOAD_API_SURFACE`. A2 visibility and encoding behaviour cannot become reachable without changing the existing composition points: `main.ts`, `preload.ts`, `renderer.ts`, and usually the renderer template. Appending the surface declaration does not create the preload registration or GUI projection.

The core must name an allowed composition root and exact integration files/interfaces. Otherwise a conforming implementer can produce only unused modules.

### 2. Three sibling encoding TMS have no composition rule

UTF-8 decode, BOM handling, and EOL handling form an ordered byte-to-document pipeline. The core forbids sibling TMS imports and forbids SMS from importing TMS, but never states who invokes the three, in what order, or how implementations are injected. Putting that orchestration back in `main.ts` merely moves the coupling outside the named sets.

Recommended minimal shape: one `utf8-document-codec` TMS implements an SMS-owned `DocumentFormatCodec` port and owns the ordered UTF-8/BOM/EOL pipeline. Split it later only if a measured island test produces real independent adapters. A more complex three-adapter design is acceptable only with an explicit SMS coordinator port and composition root.

### 3. The oracle-helper ban forbids necessary production code

The workbench is told not to write an external oracle “or any helper one could be built from.” But production must itself decode, encode, detect BOM, and preserve EOL; those helpers could always be reused to build a self-confirming oracle.

The enforceable rule is: the external oracle and independent acceptance must not import, invoke, derive expected values from, or reuse the production codec/writer. Do not prohibit production helpers needed by the product.

### 4. The role forbids author tests

`may_not: modify tests/**` prevents the implementer from adding unit, integration, or island tests, while the public workflow explicitly permits author tests and reserves only independent acceptance for a non-author. This also makes the demanded island-test report unauditable.

Separate paths and ownership, for example `tests/author/a2/**` for workbench tests and `tests/acceptance/a2/**` plus the external oracle for architect-owned acceptance.

### 5. Product security is confused with project SCL

`security.ts` contains BrowserWindow options, CSP, navigation, and preload-surface declarations. Those are product runtime security constraints. SCL in the referenced skill is the permission/risk policy defining what an actor may change. Treating the same file as both axes hides who can change the product policy.

Keep the outsourced role in a machine-checkable project SCL policy. Classify the product security boundary separately as an SMS contract and/or replaceable enforcement mechanism.

### 6. DMS has no cross-process data contract

`encoding-visibility.ts` is told to read state and project it, but the authoritative state lives in the main process and the GUI lives in the renderer. The core defines no channel name, payload schema, ownership, update event, refusal shape, or initial-state handshake. The workbench would have to invent the interface the core is supposed to supply.

### 7. Capability obligations and failure transitions are underspecified

The core names files but does not fix the `encoding-eol` state type, decode/encode signatures, named refusal codes, open/save/failure transitions, or acceptance IDs. “What to do is in the work package” is too late for architecture-defining interfaces. The request must be derived from these core contracts, not create them.

### 8. The proposed island check does not prove isolation

Direct-import grep misses barrel re-exports, dynamic imports, aliases, `require`, and transitive coupling. The project `tsconfig` compiles all `src/**/*.ts`, so successful compilation also does not prove one TMS was loaded alone.

Require a declared per-TMS dependency manifest plus an import-graph/transitive check or instrumented loader that records the modules actually loaded during the representative task.

## Classification challenges

- “Five conditions passed” is this proposal's chosen confidence rule, not an exact numeric threshold stated by `scale-thresholds.md`, which says “several together.”
- “More than three roles” was evaluated as “only one user,” but users and roles are different axes. Neo, three architect seats, the outsourced implementer, and the acceptance owner already create several roles.
- Identifier occurrence counts are a coupling heuristic, not proof of responsibility or dependency.
- `unsaved-change-guard` is not exhausted by SMS-vs-TMS identity. Its destructive-transition permission is an SCL policy; its enforcement hook may be a replaceable TMS. Preserve both axes instead of forcing one label.
- The proposed A2 BOM/EOL visibility is a product-scope addition unless the preregistration or agreed core explicitly makes it evidence for the existing `encoding-eol` capability.

## Minimum revision before my approval

1. Define `DocumentFormatContract`, exact state/refusal types, and encode/decode ports in SMS.
2. Choose one codec TMS or define an explicit coordinator/composition mechanism.
3. Name the allowed integration files and data flow across main, preload, and renderer.
4. Separate project SCL permissions from product runtime security.
5. Permit author tests in a distinct path while locking independent acceptance and oracle ownership.
6. Replace the helper ban with a verifiable no-reuse rule for oracle/acceptance.
7. Add acceptance IDs, positive controls, failure transitions, and an executable island-test mechanism.
8. Resolve whether user-visible BOM/EOL state is existing-capability evidence or a new product obligation.

## Shortcut position

Keep the general exchange shortcut stable. Add a separate A2-core draft shortcut only after the proposal is published, and label it `draft / NOT AUTHORIZED`; the workbench reads the core first, then a request derived from an agreed revision.

This review changes no core text and authorizes no outsourced production.
