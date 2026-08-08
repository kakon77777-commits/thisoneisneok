// Which declarations hold, which drifted, and what a reader can conclude.

export function render(results, currentVersion) {
  const lines = ["", `== declared compatibility aliases  (current version ${currentVersion})`];
  for (const result of results) {
    const { alias } = result;
    lines.push("");
    lines.push(`  ${result.holds ? "ok " : "!! "} ${alias.old_name} -> ${alias.replacement}` +
               `   window ${alias.valid_from}..${alias.sunset}`);
    lines.push(`      observer ${alias.equivalence.observer}, ` +
               `allowed deltas: ${alias.equivalence.allowed_deltas.join(", ") || "none"}`);
    for (const delta of result.deltas) {
      const mark = delta.allowed ? "permitted" : "NOT PERMITTED";
      lines.push(`      ${mark.padEnd(14)} ${delta.field}: ${JSON.stringify(delta.old)} -> ${JSON.stringify(delta.new)}`);
    }
    for (const problem of result.problems) lines.push(`      PROBLEM  ${problem}`);
  }

  const broken = results.filter((r) => !r.holds);
  lines.push("");
  lines.push(`  declared ${results.length}, holding ${results.length - broken.length}, ` +
             `broken ${broken.length}${broken.length ? `: ${broken.map((r) => r.alias.old_name).join(", ")}` : ""}`);
  lines.push("");
  lines.push("  a declaration is not evidence. Every line above is the run disagreeing or agreeing");
  lines.push("  with something a person wrote down, under an observer that person also chose.");
  return lines.join("\n") + "\n";
}
