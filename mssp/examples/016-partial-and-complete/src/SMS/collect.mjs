// Load the sources and the combiners, drive each source, and classify.
//
// The rule this example adds to example 015's four outcomes: `partial` is not
// a fifth label a unit hands in. A source that throws after yielding cannot
// report that it finished, because it is not the one that says so — the
// collector drives the iterator and observes where it stopped.
//
// The second rule: every record carries `from`. A record that does not is
// refused, because once records are in one array a partial batch and a
// complete batch are the same value.
import * as breaksMidway from "../TMS/sources/breaks_midway.mjs";
import * as fullBatch from "../TMS/sources/full_batch.mjs";
import * as shortBatch from "../TMS/sources/short_batch.mjs";
import * as allOrNothing from "../TMS/combiners/all_or_nothing.mjs";
import * as settleEach from "../TMS/combiners/settle_each.mjs";

export const OUTCOMES = ["worked", "empty", "partial", "failed", "absent"];

export function load(extraSources = [], extraCombiners = []) {
  const sources = {};
  const combiners = {};
  const problems = [];

  for (const module of [fullBatch, shortBatch, breaksMidway, ...extraSources]) {
    for (const attribute of ["NAME", "CAN_FAIL_WITH", "records"]) {
      if (module[attribute] === undefined) problems.push(`a source does not declare ${attribute}`);
    }
    if (!module.CAN_FAIL_WITH?.length) {
      problems.push(`${module.NAME}: CAN_FAIL_WITH is empty - a unit that cannot say what a bad ` +
        `day looks like cannot be reported as degraded`);
    }
    sources[module.NAME] = module;
  }

  for (const module of [allOrNothing, settleEach, ...extraCombiners]) {
    if (typeof module.KEEPS_PARTIAL_WORK !== "boolean") {
      problems.push(`${module.COMBINER}: KEEPS_PARTIAL_WORK is not declared - a combiner that ` +
        `does not say what it does with work already done is not a declaring unit`);
    }
    combiners[module.COMBINER] = module;
  }

  return { sources, combiners, problems };
}

export function resolveCombiner(name, combiners) {
  const module = combiners[name];
  if (module) return [module, null];
  return [null, `combiner "${name}" has no implementation - fail closed ` +
    `(known: ${Object.keys(combiners).sort().join(", ")})`];
}

// Drive one source. `finished` is observed here, never claimed by the source.
export function run(module, { absent = false } = {}) {
  if (absent) return { source: module.NAME, outcome: "absent", records: [], error: null, finished: null };

  const records = [];
  let error = null;
  try {
    for (const record of module.records()) {
      if (!record || record.from !== module.NAME) {
        throw new Error(`a record without a usable "from" reached the collector ` +
          `(got ${JSON.stringify(record?.from)}, expected ${JSON.stringify(module.NAME)})`);
      }
      records.push(record);
    }
  } catch (raised) {
    error = raised.message;
  }

  const finished = error === null;
  let outcome;
  if (!finished && records.length > 0) outcome = "partial";
  else if (!finished) outcome = "failed";
  else if (records.length > 0) outcome = "worked";
  else outcome = "empty";

  return { source: module.NAME, outcome, records, error, finished };
}

export function runAll(sources, { absent = [] } = {}) {
  return Object.keys(sources).sort()
    .map((name) => run(sources[name], { absent: absent.includes(name) }));
}

// How many of the records the reader ends up holding came from a source that
// did not finish. This is the number a count of records cannot produce.
export function fromUnfinished(runs, kept) {
  const unfinished = new Set(runs.filter((r) => r.outcome === "partial").map((r) => r.source));
  return kept.filter((record) => unfinished.has(record.from)).length;
}
