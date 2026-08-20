// What a person is shown.
//
// The rule this report exists for: two readers that both said nothing about
// completeness must not appear in the same cell. One of them could have
// spoken; the other could not.
const pad = (value, width) => String(value).padEnd(width);

export function rows(entries) {
  const lines = ["  reader           records   completeness"];
  for (const entry of entries) {
    const mark = entry.completeness.includes("CANNOT") ? "??"
      : entry.incomplete_because ? "~~" : "ok";
    lines.push(`  ${mark} ${pad(entry.reader, 15)} ${pad(entry.records.length, 9)} `
      + `${entry.completeness}${entry.incomplete_because ? ` (${entry.incomplete_because})` : ""}`);
  }
  return lines.join("\n");
}

export function challenges(entries) {
  const lines = [
    "  the challenge - two streams whose answers the harness already knows:",
    "    reader           claims   complete->silent   truncated->spoke   verdict",
  ];
  for (const { challenge, reader } of entries) {
    lines.push(`    ${pad(reader, 16)} ${pad(challenge.claimed, 8)} `
      + `${pad(challenge.rightAboutComplete, 18)} ${pad(challenge.rightAboutTruncated, 18)} `
      + `${challenge.passed ? "passed" : "failed"}`);
  }
  return lines.join("\n");
}

export function floor({ total, declared, blind }) {
  return [
    `  at least ${declared} of ${total} records come from a reader that declared itself incomplete.`,
    `  and ${blind} of ${total} come from a reader that could not have told us either way.`,
    "  The second number is what example 017's floor could not name: there, a blind reader",
    "  and a checking reader shared one column.",
  ].join("\n");
}

export function refusals(refused) {
  if (refused.length === 0) return "  no reader was refused.";
  return ["  REFUSED:", ...refused.map((r) => `    ${r.reader} - claimed a capacity the challenge `
    + `did not demonstrate (right about complete: ${r.rightAboutComplete}, `
    + `right about truncated: ${r.rightAboutTruncated})`)].join("\n");
}
