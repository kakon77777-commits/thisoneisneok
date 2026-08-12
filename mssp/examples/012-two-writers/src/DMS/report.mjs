// The traces, the final values, and what nothing here is watching.

export function outcome(rows, out) {
  out(`\n  ${"medium".padEnd(13)} ${"operation".padEnd(19)} ${"schedule".padEnd(23)} `
    + `${"ends at".padEnd(9)} ${"lost".padEnd(6)} was anybody told?`);
  for (const row of rows) {
    const lost = row.expected - row.final;
    out(`  ${row.medium.padEnd(13)} ${row.operation.padEnd(19)} ${row.schedule.padEnd(23)} `
      + `${String(row.final).padEnd(9)} ${(lost === 0 ? "-" : String(lost)).padEnd(6)} `
      + `${lost === 0 ? "-" : (row.reported ? "yes, refused" : "NO, silently")}`);
  }
}

export function trace(steps, out) {
  out("\n  what actually happened, step by step:");
  for (const step of steps) out(`    writer ${step.who}  ${step.step}${step.retry ? "  -> refused, retry" : ""}`);
}

export function gaps(out) {
  out("\n  measurable, not measured here:");
  out("    - what retries cost under real contention");
  out("    - how often a real application's writes actually overlap");
  out("\n  not measurable by this program at all:");
  out("    - whether any schedule a real scheduler produces is covered. The two");
  out("      here are written down; a system with more steps has more of them,");
  out("      and nothing in this example enumerates that space.");
  out("    - whether compare-and-set is the right repair. It converts a lost");
  out("      update into a retry, which is a different problem, not no problem.");
}
