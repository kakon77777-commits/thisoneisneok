# Review checklist

Run before publishing any example. A failure here is information, not an
obstacle — it usually means the boundary is in the wrong place.

## Island test

The core claim of MSSP is that a TMS can be understood and exercised alone. If
that is not true, the module is not a subset; it is a fragment.

1. Load only the minimal SMS the module declares.
2. Load exactly one TMS.
3. Stub every external tool.
4. Run that TMS's representative task.
5. Check inputs, outputs, and refused permissions.
6. Confirm no other TMS was loaded.

Failing on step 6 is the common one, and it is usually invisible from reading
the module — the dependency arrives through a shared import several levels down.

## Structural checks

- [ ] Does every TMS avoid importing a sibling TMS? (grep, do not eyeball)
- [ ] Does each TMS declare the SMS interfaces it uses?
- [ ] Is any declared dependency actually unused?
- [ ] Is any used dependency undeclared?
- [ ] Does removing one TMS leave the core running?
- [ ] Does FMS contain any executable procedure? It should not.
- [ ] Is any SMS entry there because it is *frequent* rather than *constitutive*?
- [ ] Are permissions expressed so something can check them, or only as prose?

## Honesty checks

These are the ones worth being strict about, because a published example that
overstates itself teaches the wrong lesson to everyone who copies it.

- [ ] Does the README's "does not solve" section contain something real?
- [ ] Does the stated island-test result match what the command actually prints?
- [ ] Does the example's structure match what the README says it is? Re-read the
      code against the prose; drift between them is easy and invisible.
- [ ] Would this structure be *worse* than the unstructured version at this
      size? If so, say so in the README — MSSP applied too early is a genuine
      cost, and pretending otherwise makes the whole field lab less credible.

## Before saying it is done

`Done = Runs ∧ IslandTested ∧ ReviewedAgainstREADME ∧ Published`

Generating the files is not the same as any of these. Run the command, read the
output, and check the built page renders — a build reporting success while the
page shows something else is a failure mode that has already happened on this
site more than once.
