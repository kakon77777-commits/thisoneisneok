// What a person is shown.
//
// An incentive is never printed as a single number. It is printed as the pair
// it was computed from, because "+3" without "3 -> 6" is a claim nobody can
// re-derive.
const pad = (v, w) => String(v).padEnd(w);

export function rows(result) {
  const lines = ["  source        held   kept   declared                note"];
  for (const row of result.rows) {
    lines.push(`  ${pad(row.source, 13)} ${pad(row.held, 6)} ${pad(row.kept.length, 6)} `
      + `${pad(row.incomplete_because ?? "-", 23)} ${row.note ?? ""}`.trimEnd());
  }
  lines.push(`  total kept: ${result.total}`);
  return lines.join("\n");
}

export function incentives(measured) {
  const lines = [
    "  what declaring cost or paid, measured by suppressing it and re-running:",
    "    unit          suppressed   declared   delta   reading",
  ];
  for (const m of measured) {
    const reading = m.delta < 0 ? "declaring COST it"
      : m.delta > 0 ? "declaring PAID"
        : "declared nothing - the control";
    lines.push(`    ${pad(m.source, 13)} ${pad(m.suppressed, 12)} ${pad(m.declared, 10)} `
      + `${pad(m.delta > 0 ? `+${m.delta}` : m.delta, 7)} ${reading}`);
  }
  return lines.join("\n");
}
