// What ran, under what name, and what did not run.

export function render(run) {
  const out = [];
  out.push("\n== rules");
  for (const entry of run.rules) {
    const via = entry.deprecated
      ? `  <- requested as ${entry.requested}, renamed in ${entry.hops.at(-1).since}`
      : "";
    out.push(`  ${entry.loaded ? "ok " : "?? "} ${entry.name.padEnd(24)}${via}`);
    if (!entry.loaded) out.push(`      ${entry.why}`);
  }

  out.push("\n== findings");
  if (run.findings.length === 0) {
    out.push("  none — and the next section says how much that is worth");
  }
  for (const f of run.findings) {
    out.push(`  ${String(f.line).padStart(3)}  ${f.id.padEnd(24)} ${f.message}`);
  }

  // Upstream reports a deprecated rule through eslint's own deprecation
  // channel, which the caller has to be looking at. Here it is in the run
  // report, beside the result it produced.
  out.push("\n== what this run does not say");
  out.push(`  lines scanned                    ${run.linesScanned}`);
  const idle = run.rules.filter((r) => r.loaded && !run.findings.some((f) => f.id === r.name));
  out.push(
    `  enabled, loaded, found nothing   ${idle.length ? idle.map((r) => r.name).join(", ") : "none"}`,
  );
  out.push(
    `  deprecated names resolved        ${
      run.rules.filter((r) => r.deprecated).map((r) => `${r.requested} -> ${r.name}`).join(", ") || "none"
    }`,
  );
  return `${out.join("\n")}\n`;
}
