// What a person is shown.
//
// The one thing this report may never do is print a record count on its own,
// because that is the number three different situations share.
const pad = (value, width) => String(value).padEnd(width);

export function runs(rows) {
  const lines = ["  source          outcome   records   finished   error"];
  for (const row of rows) {
    const mark = { worked: "ok", empty: "--", partial: "~~", failed: "!!", absent: "  " }[row.outcome];
    lines.push(`  ${mark} ${pad(row.source, 13)} ${pad(row.outcome, 9)} ${pad(row.records.length, 9)} ` +
      `${pad(row.finished === null ? "-" : row.finished, 10)} ${row.error ?? ""}`.trimEnd());
  }
  return lines.join("\n");
}

export function combined(name, result, unfinished) {
  const lines = [];
  if (result.refused) {
    lines.push(`  ${name}: REFUSED - ${result.refused}`);
    lines.push(`  ${result.discarded} record(s) already in hand were discarded, and the work that ` +
      `produced them ran to completion anyway.`);
    return lines.join("\n");
  }
  lines.push(`  ${name}: ${result.records.length} record(s) kept`);
  if (unfinished > 0) {
    lines.push(`  ${unfinished} of them came from a source that did NOT finish - which is a fact ` +
      `about the records, not about the run.`);
  }
  return lines.join("\n");
}

export function whatACountWouldHaveSaid(rows) {
  const twos = rows.filter((row) => row.records.length === 2);
  const lines = ["  what a count alone would have said:"];
  for (const row of twos) {
    lines.push(`    ${pad(row.source, 15)} 2 records - and this is ${row.outcome}`);
  }
  lines.push(`    ${twos.length} sources, one number, ${new Set(twos.map((r) => r.outcome)).size} outcomes`);
  return lines.join("\n");
}
