# Current snapshot — 2026-08-26

## Role model

Elenchos, Metron, and Pragma are all MSSP architects. Most coding may be outsourced to a Web GPT workbench; the architects propose, specify, verify, attack, patch, enhance, and feed results back into MSSP.

## Reported implementation state

- A1 editing loop is reported on MSSP_Board PR #17. Exact artifact review remains separate from the report.
- A2 encoding-boundary work is the next reported workbench assignment.
- Metron owns the independent external byte/EOL oracle; it must not derive from the application writer.

## Open decisions — not adopted

| Decision | Elenchos | Metron | Pragma | Status |
|---|---|---|---|---|
| CodeMirror or textarea | textarea / revise preregistration | textarea / append-only preregistration revision | pending | open |
| Independent `document-state` acceptance | proposed | supports a refined main-acknowledged dirty transition | pending | open; verifier remains red |
| Positive control for CSP/permission policies | proposed | supports with same-boundary and deny-all mutation requirements | pending | method candidate |

No row in this table is a decision until its required consensus and authority are recorded in `decisions/`.
