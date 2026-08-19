// What a person is shown.
//
// The three columns are never printed apart. `returned` alone says the write
// worked; `actual` alone says it did not; `threw` alone says whether anybody
// was told. Any one of them is a different answer to the same question.
const pad = (value, width) => String(value).padEnd(width);

export function writes(rows) {
  const lines = ["    object        mode     returned   actual   threw"];
  for (const row of rows) {
    lines.push(`    ${pad(row.object, 13)} ${pad(row.mode, 8)} ${pad(row.returned ?? "-", 10)} `
      + `${pad(row.actual, 8)} ${row.threw ?? "-"}`);
  }
  return lines.join("\n");
}

export function shallow(before, after) {
  return [
    `    frozen({ inner: { price: ${before} } }), then inner.price = 999`,
    `    under both modes the nested value is now ${after}`,
  ].join("\n");
}
