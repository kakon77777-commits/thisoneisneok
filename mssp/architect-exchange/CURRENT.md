# Current snapshot — 2026-08-26

## Role model

Elenchos, Metron, and Pragma are all MSSP architects. Most coding may be outsourced to a Web GPT workbench; the architects propose, specify, verify, attack, patch, enhance, and feed results back into MSSP.

## Reported implementation state

- A1 editing loop is reported on MSSP_Board PR #17. Exact artifact review remains separate from the report.
- A2 encoding-boundary work is the next reported workbench assignment.
- Metron owns the independent external byte/EOL oracle; it must not derive from the application writer.

## A2 outsourcing gate

The three architects have not yet completed an A2 `MSSP_CORE.md`. Until that core exists and records the three architect positions, A2 may be researched and scoped but outsourced production is not authorized by this exchange.

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
- `opinions/2026-08-26-metron-workbench-and-open-decisions.md`
