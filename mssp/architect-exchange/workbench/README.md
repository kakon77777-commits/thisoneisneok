# Workbench packages

One task per directory:

```text
YYYY-MM-DD-<task>/
  MSSP_CORE.md
  REQUEST.md
  INPUTS.md
  RESULT.md
  artifacts/
```

`MSSP_CORE.md` is written by the three architects before outsourced production and defines the architecture the workbench must preserve. `REQUEST.md` is derived from that core and is the bounded implementation authority. `INPUTS.md` pins exact sources and hashes. `RESULT.md` is a delivery description, not acceptance evidence.

If `MSSP_CORE.md` is missing, internally contradictory, or leaves a required ownership/interface decision unresolved, the workbench stops before production and reports the gap.
