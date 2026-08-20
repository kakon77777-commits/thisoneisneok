// What a person is shown.
//
// `compiles` is never printed without the warning column beside it, because
// "it built" is the answer three different situations share here.
const pad = (value, width) => String(value).padEnd(width);

export function table(rows) {
  const lines = ["    route                compiles   must_use warning   error"];
  for (const row of rows) {
    lines.push(`    ${pad(row.route.NAME, 20)} ${pad(row.compiles ? "yes" : "NO", 10)} `
      + `${pad(row.mustUseWarning ? "yes" : row.denied ? "as an ERROR" : "-", 18)} `
      + `${row.errorCode ?? "-"}`);
  }
  return lines.join("\n");
}

export function boundary(discardPlain, discardStrict, assign) {
  return [
    "  the boundary, in two facts:",
    `    extraction is forced      - ${assign.route.NAME} does not compile (${assign.errorCode})`,
    `    discarding is not         - ${discardPlain.route.NAME} compiles, no warning`,
    `    and the loudest setting available does not change that: still `
      + `${discardStrict.compiles ? "compiles" : "refused"}`,
    "",
    "  So the type system forces the Err case to be NAMED wherever the value is used,",
    "  and forces nothing at all where the value is thrown away.",
  ].join("\n");
}
