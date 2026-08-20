// The challenge, and the read pipeline that depends on it.
//
// 改良點 15 forbids a unit from declaring itself complete, because nothing
// outside it can check that. But the Board host asked the question that rule
// leaves open: how does a report tell "this reader checked its framing and saw
// no further pages" from "this reader is an opaque pipe that swallowed
// whatever arrived", without letting the first one make a positive assertion?
//
// The answer is to move what is declared. A unit does not declare its STATE.
// It declares its CAPACITY — what it is able to observe — and a capacity claim
// is answerable, because the harness can hand it a case whose answer it
// already knows.
//
// The challenge needs BOTH arms. A reader that always answers "truncated" is
// right about the truncated case, so a one-armed challenge passes a constant.
import * as claimsFraming from "../TMS/readers/claims_framing.mjs";
import * as framed from "../TMS/readers/framed.mjs";
import * as opaquePipe from "../TMS/readers/opaque_pipe.mjs";

export const COMPLETE_STREAM = "r-1|r-2|r-3|<end>";
export const TRUNCATED_STREAM = "r-1|r-2|r-3";

// The three states a completeness column may hold. There is still no
// verified-complete value (改良點 15); what is new is that silence is split in
// two, by whether the reader could have spoken.
export const DECLARED_INCOMPLETE = "no - declared";
export const SILENT_AND_CAN_TELL = "not known otherwise, and this reader can tell";
export const SILENT_AND_CANNOT = "not known otherwise, and this reader CANNOT tell";

export function load(extra = []) {
  const readers = {};
  const problems = [];
  for (const module of [framed, opaquePipe, claimsFraming, ...extra]) {
    const name = module.NAME;
    if (!name) {
      problems.push("a reader module does not declare NAME");
      continue;
    }
    for (const attribute of ["CAN_FAIL_WITH", "HOW", "read"]) {
      if (module[attribute] === undefined) problems.push(`${name} does not declare ${attribute}`);
    }
    if (typeof module.CLAIMS_CAN_DISCRIMINATE !== "boolean") {
      problems.push(`${name}: does not claim a discrimination capacity either way - the report `
        + `would have nowhere to put its silence`);
    }
    for (const vouch of ["COMPLETE", "IS_COMPLETE", "RETURNS_EVERYTHING"]) {
      if (module[vouch] === true) {
        problems.push(`${name}: declares ${vouch} - a unit may declare what it can OBSERVE, `
          + `never what its state is (改良點 15)`);
      }
    }
    if (problems.some((p) => p.startsWith(`${name}:`) || p.startsWith(`${name} `))) continue;
    readers[name] = module;
  }
  return { readers, problems };
}

// Hand the reader two streams whose answers the harness already knows, and see
// whether it separates them. Both arms are required: `passed` is the
// conjunction, so a reader that answers the same way every time fails.
export function challenge(module) {
  const onComplete = module.read(COMPLETE_STREAM).incomplete_because;
  const onTruncated = module.read(TRUNCATED_STREAM).incomplete_because;
  const rightAboutComplete = onComplete === null;
  const rightAboutTruncated = onTruncated !== null;
  return {
    reader: module.NAME,
    claimed: module.CLAIMS_CAN_DISCRIMINATE,
    rightAboutComplete,
    rightAboutTruncated,
    passed: rightAboutComplete && rightAboutTruncated,
    // A reader that got exactly one arm right answered the same way twice.
    constant: rightAboutComplete !== rightAboutTruncated,
  };
}

export function verdict(result) {
  if (result.claimed && result.passed) return "capacity claimed and demonstrated";
  if (result.claimed && !result.passed) return "REFUSED: capacity claimed and not demonstrated";
  if (!result.claimed && result.passed) return "capacity disclaimed but demonstrated - accepted, "
    + "and the report treats it as blind because that is the conservative direction";
  return "capacity disclaimed, and the challenge agrees";
}

export const accepted = (result) => !(result.claimed && !result.passed);

export function run(module, stream, challengeResult) {
  const result = module.read(stream);
  let completeness;
  if (result.incomplete_because) completeness = DECLARED_INCOMPLETE;
  else if (challengeResult.claimed && challengeResult.passed) completeness = SILENT_AND_CAN_TELL;
  else completeness = SILENT_AND_CANNOT;
  return {
    reader: module.NAME,
    records: result.records,
    incomplete_because: result.incomplete_because,
    completeness,
  };
}

export function readAll(readers, stream) {
  return Object.keys(readers).sort().map((name) => {
    const result = challenge(readers[name]);
    return { ...run(readers[name], stream, result), challenge: result };
  });
}

// The floor, now with the part example 017 could not name: how many records
// came from a reader that could not have told us either way.
export function floor(rows) {
  const total = rows.reduce((n, row) => n + row.records.length, 0);
  const declared = rows.filter((r) => r.completeness === DECLARED_INCOMPLETE)
    .reduce((n, row) => n + row.records.length, 0);
  const blind = rows.filter((r) => r.completeness === SILENT_AND_CANNOT)
    .reduce((n, row) => n + row.records.length, 0);
  return { total, declared, blind };
}
