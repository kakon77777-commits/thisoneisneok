// Reader resolution by id, and the read path over a parsed request.
//
// The parse itself is deliberately the platform's: URLSearchParams already
// keeps every value, and the loss this example is about happens later, at the
// read. Re-implementing the parser would have hidden that.
import * as declaredArity from "../TMS/readers/declared_arity.mjs";
import * as firstWins from "../TMS/readers/first_wins.mjs";
import * as lastWins from "../TMS/readers/last_wins.mjs";

const READERS = Object.fromEntries(
  [firstWins, lastWins, declaredArity].map((module) => [module.READER, module]));

export const readerNames = () => Object.keys(READERS).sort();

export function resolveReader(name) {
  const module = READERS[name];
  if (!module) {
    return { problem: `reader "${name}" has no implementation - fail closed (known: ${readerNames().join(", ")})` };
  }
  return { module };
}

export function parse(queryString) {
  const params = new URLSearchParams(queryString);
  return Object.fromEntries([...new Set(params.keys())].map((key) => [key, params.getAll(key)]));
}

export function readAll(queryString, readerName, fields) {
  const { module, problem } = resolveReader(readerName);
  if (problem) return { problem };
  const parsed = parse(queryString);
  const rows = Object.entries(fields).map(([name, spec]) => {
    const values = parsed[name] ?? [];
    const outcome = module.read(values, spec.arity);
    return { field: name, arity: spec.arity, received: values.length, ...outcome };
  });
  return { reader: readerName, rows, refusals: rows.filter((row) => row.refused) };
}
