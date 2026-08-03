// The run report.
//
// The whole example is here. A migration that says
//
//     500 records migrated, 0 errors
//
// is compatible with all of these: it migrated 500 correctly; it skipped 500
// silently; it migrated three and returned early; the input was empty. The
// sentence is true in every case and useless in every case.
//
// So this report answers three questions the summary cannot:
//
//   1. Does the arithmetic balance?  Every record must appear exactly once.
//      Zero failures says nothing about whether the loop visited everything.
//   2. Can I see one?  A witness sample, before and after, including for
//      records nothing changed — an unchanged claim without the pair is the
//      same shape of assertion this example argues against.
//   3. What did NOT happen?  A capability that was never invoked is reported
//      as loudly as one that failed, because a green run over a fixture that
//      never reaches a transform is the commonest way to believe something
//      works that has never executed.
//
// It renders; it decides nothing. Reconciliation is SMS — a report that
// computed its own correctness would be marking its own work.

import { declaredReads } from "../SCL/policy.js";
import { APPLIED, DROPPED, FAILED, UNCHANGED } from "../SMS/model.js";

const pad = (value, width) => String(value).padStart(width);

function fields(record) {
  return Object.entries(record.fields)
    .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
    .join(" ");
}

export function render({ outcomes, invocations, declines, reconciliation }, { witnesses = 2 } = {}) {
  const lines = [];
  const r = reconciliation;

  lines.push("  reconciliation");
  lines.push(`    input                ${pad(r.input, 4)}`);
  for (const kind of [APPLIED, UNCHANGED, DROPPED, FAILED]) {
    lines.push(`    ${kind.padEnd(20)} ${pad(r.counts[kind], 4)}`);
  }
  lines.push(`    accounted for        ${pad(r.accounted, 4)}`);
  if (!r.balanced) {
    lines.push(`    UNBALANCED           missing ${r.missing}, duplicated [${r.duplicated.join(", ")}]`);
    lines.push("    the run is not trustworthy regardless of the failure count");
  } else {
    lines.push("    balanced: every record appears exactly once");
  }

  lines.push("");
  lines.push("  capabilities");
  for (const [name, count] of Object.entries(invocations)) {
    const changed = outcomes.filter((o) => o.by === name && o.kind === APPLIED).length;
    if (count === 0) {
      // The loud case. Not an error — but a claim about this capability is
      // unsupported by this run, and the report says which fields would have
      // been needed to support one.
      const reads = declaredReads(name);
      lines.push(`    ${name.padEnd(26)} NEVER INVOKED`);
      lines.push(`    ${" ".repeat(26)}   declined ${declines[name]} record(s); reads ${reads.join(", ") || "(undeclared)"}`);
      lines.push(`    ${" ".repeat(26)}   this run says nothing about whether it works`);
    } else {
      lines.push(`    ${name.padEnd(26)} invoked ${pad(count, 3)}, changed ${pad(changed, 3)}, declined ${pad(declines[name], 3)}`);
    }
  }

  lines.push("");
  lines.push(`  witnesses (${witnesses} per outcome kind, before -> after)`);
  for (const kind of [APPLIED, UNCHANGED, DROPPED, FAILED]) {
    const sample = outcomes.filter((o) => o.kind === kind).slice(0, witnesses);
    if (sample.length === 0) {
      lines.push(`    ${kind}: none in this run`);
      continue;
    }
    for (const item of sample) {
      lines.push(`    ${kind} ${item.id} by ${item.by}`);
      lines.push(`      before  ${fields(item.before)}`);
      if (item.kind === APPLIED) lines.push(`      after   ${fields(item.after)}`);
      else lines.push(`      reason  ${item.reason || "(none given)"}`);
    }
  }

  return lines.join("\n");
}

/**
 * Whether this run is evidence of anything.
 *
 * Separate from `render` on purpose: the report is for a human, and this is for
 * a caller that has to decide. A balanced run in which every capability was
 * never invoked is a successful run that demonstrates nothing.
 */
export function assessment({ invocations, reconciliation }) {
  const unexercised = Object.entries(invocations).filter(([, n]) => n === 0).map(([name]) => name);
  return {
    trustworthy: reconciliation.balanced,
    unexercised,
    demonstrates: reconciliation.balanced && unexercised.length < Object.keys(invocations).length,
  };
}
