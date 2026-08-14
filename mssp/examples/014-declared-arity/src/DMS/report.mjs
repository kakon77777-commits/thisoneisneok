// What each reader returned, and which of them could not have refused.

export function table(results, fields, out) {
  const readers = results.map((r) => r.reader);
  out(`\n  ${"field".padEnd(7)} ${"declared".padEnd(14)} ${"got".padEnd(5)} `
    + readers.map((r) => r.padEnd(30)).join(""));
  for (const [index, name] of Object.keys(fields).entries()) {
    const first = results[0].rows[index];
    const cells = results.map((result) => {
      const row = result.rows[index];
      return (row.refused ? `REFUSED (${row.because})` : JSON.stringify(row.value)).padEnd(30);
    });
    out(`  ${name.padEnd(7)} ${first.arity.padEnd(14)} ${String(first.received).padEnd(5)} ${cells.join("")}`);
  }
}

export function whoCouldRefuse(results, modules, out) {
  out("\n  which readers can come back empty-handed at all:");
  for (const result of results) {
    const module = modules[result.reader];
    out(`    ${result.reader.padEnd(16)} refuses=${String(module.REFUSES).padEnd(6)} ${module.ON_MULTIPLICITY}`);
  }
}

export function gaps(out) {
  out("\n  measurable, not measured here:");
  out("    - how often real requests carry a repeated key by accident rather than design");
  out("    - what refusing costs a caller who was relying on first-wins");
  out("\n  not measurable by this program at all:");
  out("    - whether refusing is the right policy. Coercing, clamping and taking the");
  out("      last are all defensible; what is not defensible is choosing one without");
  out("      saying so, which is the only thing this example takes a position on.");
  out("    - whether a declared arity is correct. Someone wrote `page: one`, and");
  out("      nothing here can tell a wrong declaration from a wrong request.");
}
