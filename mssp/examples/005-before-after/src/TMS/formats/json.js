// The third format, added to the MSSP version. Nothing else changes except one
// line of policy — main.js computes the import from the requested name.
export const name = "formats/json";

export function render(summary, dropped) {
  return JSON.stringify({ summary, dropped: dropped.length }, null, 2);
}
