// Renders a summary as CSV. Knows nothing of formats/text.
export const name = "formats/csv";

export function render(summary, dropped) {
  const lines = ["sensor,n,mean,min,max"];
  for (const s of summary) lines.push(`${s.sensor},${s.n},${s.mean},${s.min},${s.max}`);
  lines.push(`# ${dropped.length} row(s) dropped`);
  return lines.join("\n");
}
