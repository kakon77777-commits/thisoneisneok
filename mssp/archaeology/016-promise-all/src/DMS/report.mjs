// What a person is shown. The columns exist so that "what the caller holds"
// and "what actually ran" can never be read as the same number.
const pad = (value, width) => String(value).padEnd(width);

export function comparison(rows) {
  const lines = ["    combinator            kept   ran        reasons"];
  for (const row of rows) {
    lines.push(`    ${pad(row.name, 21)} ${pad(row.kept, 6)} ${pad(row.ran, 10)} ${row.reasons}`);
  }
  return lines.join("\n");
}

export function removalTable(removed, kept) {
  return [
    "                             values the caller receives",
    `    rejecting member removed  ${removed}`,
    `    rejecting member present  ${kept}`,
  ].join("\n");
}

export function settled(results) {
  const lines = ["    status     value or reason"];
  for (const result of results) {
    lines.push(`    ${pad(result.status, 10)} ${result.status === "fulfilled" ? result.value : result.reason.message}`);
  }
  return lines.join("\n");
}
