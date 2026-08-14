export function readings(values, out) {
  out("\n  one key with three values, read every way ordinary code reads it:");
  for (const [label, value] of Object.entries(values)) {
    out(`    ${label.padEnd(22)} ${JSON.stringify(value)}`);
  }
}

// `original` is measured from the sample rather than written here. The first
// version hardcoded 3 for "all" and flagged `append` as a mismatch — append
// keeps all three AND adds one, so the check was wrong and the accessor was
// not. A hardcoded expectation is the defect this lab keeps filing.
export function declarations(loaded, measured, original, out) {
  out(`\n  ${"accessor".padEnd(14)} ${"declared".padEnd(10)} ${"survivors".padEnd(11)} keeps`);
  for (const name of Object.keys(loaded).sort()) {
    const module = loaded[name];
    const holds = module.HOW_MANY_SURVIVE === "one"
      ? measured[name] === 1
      : measured[name] >= original;
    const mark = holds ? " " : "!";
    out(`  ${mark} ${module.ACCESSOR.padEnd(12)} ${module.HOW_MANY_SURVIVE.padEnd(10)} `
      + `${String(measured[name]).padEnd(11)} ${module.KEEPS}`);
  }
}

export function gaps(out) {
  out("\n  measurable, not measured here:");
  out("    - how often a repeated key reaches a real handler by accident");
  out("    - how many frameworks convert params to a plain object by default");
  out("\n  not measurable by this entry at all:");
  out("    - whether the WHATWG design is wrong. A URL query genuinely permits");
  out("      repetition, so an accessor returning one value has to choose, and");
  out("      `get` is honestly named for what it returns.");
  out("    - what any particular caller believed `get` meant.");
}
