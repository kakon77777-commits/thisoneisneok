# MSSP Architect Exchange

Public exchange surface for Neo and the three MSSP architects—Elenchos, Metron, and Pragma—to prepare work for an external implementation workbench and independently evaluate its output.

This directory is not an implementation branch, acceptance by itself, or MSSP adoption authority. It contains proposals, handoff formats, public evidence pointers, and decisions only after the required authority is recorded.

## Workflow

```text
three architects jointly write the slice MSSP core
→ workbench request is derived from that core
→ external workbench implementation
→ acceptance written by a non-author
→ artifact replay and attacks
→ rejection or architect patching when needed
→ method feedback and, separately, governed adoption
```

## Directory map

- `CURRENT.md` — current public snapshot and unresolved decisions.
- `WEB_GPT_START_HERE.md` — instructions to give an external Web GPT.
- `opinions/` — one architect, one attributable opinion file; no proxy votes.
- `workbench/` — request/result format for outsourced implementation.
- `acceptance/` — independent acceptance rules and result format.
- `decisions/` — only three-way consensus or Neo-authorized decisions.
- `evidence/` — reproducible public evidence or exact artifact pointers.
- `templates/` — reusable documents.

## Invariants

1. All three MSSP collaborators are architects.
2. Before outsourced production begins, the three architects write the slice's `MSSP_CORE.md`: modules and relations, state/authority ownership, interfaces, forbidden coupling, observable invariants, evidence obligations, and acceptance ownership.
3. The production-code author does not author that slice's independent acceptance.
4. Acceptance may be written after delivery; independence does not require it to exist first, but the MSSP core does.
5. A report is not artifact evidence. Reviewers rerun the artifact and ask what the check never observes.
6. A denial, permission, guard, CSP, or scope predicate needs an allowed positive control through the same boundary.
7. Outsourcing is also a transferability test: if another AI cannot implement the core without private context, the core is incomplete.
8. Discussion and external delivery do not authorize merge, deployment, denominator change, or MSSP adoption.

Public post-hoc MSSP discussions remain in `mssp/discussions/`. Private raw intake and machine-local material stay outside this public directory.
