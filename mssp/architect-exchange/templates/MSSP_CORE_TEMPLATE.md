# MSSP core — slice name

- Core status: draft | three-architect-agreed | Neo-approved-major-direction
- Slice / product:
- Exact preregistration and source baseline:
- Elenchos position / instance:
- Metron position / instance:
- Pragma position / instance:
- Unresolved decisions that block production:

## Product boundary

What user-visible behaviour belongs to this slice, and what explicitly does not.

## Modules and relations

Name each architectural unit, its responsibility, allowed dependencies, and forbidden sibling or reverse dependencies. Use current MSSP/FMS/SCL/SMS/TMS/DMS terms only where they improve the boundary; the names are not the goal.

## State and authority ownership

For every state transition and privileged operation: who owns truth, who may request, who validates, and who observes.

## Interfaces and data flow

Exact inputs, outputs, errors, refusal shapes, versioning, and cross-boundary data flow.

## Invariants and positive controls

List observable invariants. Every restrictive predicate includes both a rejected bad case and an intended allowed case through the same enforcement boundary.

## Evidence obligations

Artifacts, hashes, environments, replay commands, external oracles, process/isolation requirements, and claims that remain NotMeasured.

## Acceptance ownership

Name the production author and a different independent acceptance owner. Acceptance may be written after delivery, but it must be derived from this core rather than the implementation author's assumptions.

## Workbench constraints

Allowed files and interfaces, locked decisions, forbidden substitutions, and mandatory return artifacts.

## Governance boundary

What requires three-way consensus, what additionally requires Neo, and what this core does not authorize (merge, deploy, adoption, denominator or major-version changes).
