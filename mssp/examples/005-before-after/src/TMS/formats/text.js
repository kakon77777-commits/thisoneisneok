// Renders a summary for a terminal. Reads SMS shapes only.
export const name = "formats/text";

export function render(summary, dropped) {
  const lines = summary.map(
    (s) => `  ${s.sensor.padEnd(8)} n=${s.n}  mean=${s.mean}  range=${s.min}..${s.max}`,
  );
  lines.push(`  ${dropped.length} row(s) dropped`);
  return lines.join("\n");
}
