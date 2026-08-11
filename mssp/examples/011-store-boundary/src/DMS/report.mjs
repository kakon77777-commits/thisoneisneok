// What was written, what came back, and what nothing here is watching.

export function written(results, out) {
  for (const { record, outcome } of results) {
    const mark = outcome.written ? "ok" : "!!";
    out(`    ${mark}  ${record.id.padEnd(12)} ${outcome.written ? "written" : outcome.problems.join("; ")}`);
  }
}

export function readBack(store, keys, out) {
  for (const key of keys) {
    const record = store.get(key);
    out(`    ${key.padEnd(12)} ${record ? `${record.items.length} item(s), total ${record.total}` : "not found"}`);
  }
}

export function boundary(label, before, after, out) {
  out(`    ${label.padEnd(34)} before ${JSON.stringify(before)}`);
  out(`    ${"".padEnd(34)} after  ${JSON.stringify(after)}`);
}

export function gaps(out) {
  out("\n  measurable, not measured here:");
  out("    - what copying costs on a record large enough to care");
  out("    - how often callers actually mutate what a store handed them");
  out("\n  not measurable by this program at all:");
  out("    - whether copies are the right default for a given system. A cache that");
  out("      hands out live references is a correct design when the callers know it;");
  out("      what makes it a defect is being silent about which one you are.");
  out("    - anything about concurrency. One process, one writer. Two writers would");
  out("      break this store and nothing here would notice, which is a limitation");
  out("      of the example rather than a finding about stores.");
}
