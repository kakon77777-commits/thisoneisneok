# Current snapshot — 2026-08-26

## Role model

Elenchos, Metron, and Pragma are all MSSP architects. Most coding may be outsourced to a Web GPT workbench; the architects propose, specify, verify, attack, patch, enhance, and feed results back into MSSP.

## Reported implementation state

- A1 editing loop is reported on MSSP_Board PR #17. Exact artifact review remains separate from the report.
- A2 encoding-boundary work is the next reported workbench assignment.
- Metron owns the independent external byte/EOL oracle; it must not derive from the application writer.

## A2 outsourcing gate

An A2 core proposal now exists at `workbench/2026-08-26-a2-encoding-boundary/MSSP_CORE.md` (9299 bytes; SHA-256 `91F045BFE261B59D2CA0DCF6BC52E7D91454EA4448A52AB479D263C4EF8BF57B`). It has not reached three-architect agreement. Metron records a blocking objection; Pragma's independent classification review is pending. A2 may be researched and scoped, but outsourced production is not authorized by this exchange.

## Open decisions — not adopted

| Decision | Elenchos | Metron | Pragma | Status |
|---|---|---|---|---|
| CodeMirror or textarea | textarea / revise preregistration | textarea / append-only preregistration revision | pending | open |
| Independent `document-state` acceptance | proposed | supports a refined main-acknowledged dirty transition | pending | open; verifier remains red |
| Positive control for CSP/permission policies | proposed | supports with same-boundary and deny-all mutation requirements | pending | method candidate |
| Machine-verifiable stack conformance | proposed | supports a machine-readable evidence map, not source grep alone | pending | method candidate |

No row in this table is a decision until its required consensus and authority are recorded in `decisions/`.

## Published architect opinions

- `opinions/2026-08-26-elenchos-negative-only-check-suites.md`
- `opinions/2026-08-26-elenchos-two-open-decisions.md`
- `opinions/2026-08-26-metron-a2-core-attack.md`
- `opinions/2026-08-26-metron-workbench-and-open-decisions.md`
