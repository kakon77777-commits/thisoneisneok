// The before. One file, no structure, and nothing wrong with it.
//
// This is not a strawman. It is what a competent person writes for a job this
// size, and example 005 exists to measure the difference honestly rather than
// to make the monolith look bad. Read it: it is shorter and clearer than the
// restructured version, and that is a real finding.
//
//   node baseline/monolith.js
//
// It reads a small table of readings, drops the invalid rows, and prints a
// report in one of two formats.

const READINGS = [
  { sensor: "north", celsius: 21.4, at: "09:00" },
  { sensor: "north", celsius: 22.1, at: "10:00" },
  { sensor: "south", celsius: null, at: "09:00" },
  { sensor: "south", celsius: 19.8, at: "10:00" },
  { sensor: "roof", celsius: 84.2, at: "09:00" },
];

const PLAUSIBLE = { min: -60, max: 60 };

function validate(rows) {
  const kept = [];
  const dropped = [];
  for (const row of rows) {
    if (row.celsius === null || row.celsius === undefined) {
      dropped.push({ row, why: "no reading" });
    } else if (row.celsius < PLAUSIBLE.min || row.celsius > PLAUSIBLE.max) {
      dropped.push({ row, why: `outside ${PLAUSIBLE.min}..${PLAUSIBLE.max}` });
    } else {
      kept.push(row);
    }
  }
  return { kept, dropped };
}

function summarise(rows) {
  const bySensor = new Map();
  for (const row of rows) {
    if (!bySensor.has(row.sensor)) bySensor.set(row.sensor, []);
    bySensor.get(row.sensor).push(row.celsius);
  }
  return [...bySensor.entries()].map(([sensor, values]) => ({
    sensor,
    n: values.length,
    mean: Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)),
    min: Math.min(...values),
    max: Math.max(...values),
  }));
}

function renderText(summary, dropped) {
  const lines = summary.map(
    (s) => `  ${s.sensor.padEnd(8)} n=${s.n}  mean=${s.mean}  range=${s.min}..${s.max}`,
  );
  lines.push(`  ${dropped.length} row(s) dropped`);
  return lines.join("\n");
}

function renderCsv(summary, dropped) {
  const lines = ["sensor,n,mean,min,max"];
  for (const s of summary) lines.push(`${s.sensor},${s.n},${s.mean},${s.min},${s.max}`);
  lines.push(`# ${dropped.length} row(s) dropped`);
  return lines.join("\n");
}

function renderJson(summary, dropped) {
  return JSON.stringify({ summary, dropped: dropped.length }, null, 2);
}

function main(argv) {
  const { kept, dropped } = validate(READINGS);
  const summary = summarise(kept);
  const format = argv.includes("--csv") ? "csv" : argv.includes("--json") ? "json" : "text";
  console.log(`\n== readings (${format})`);
  console.log(
    format === "csv" ? renderCsv(summary, dropped)
    : format === "json" ? renderJson(summary, dropped)
    : renderText(summary, dropped),
  );
  return 0;
}

process.exit(main(process.argv.slice(2)));
