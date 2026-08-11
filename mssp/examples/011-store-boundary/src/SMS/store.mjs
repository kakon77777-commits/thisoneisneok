// The store: what a valid record is, and the read/write path.
//
// What a read HANDS BACK is not decided here. The strategies are TMS units,
// resolved by id — 008 cost a day to the difference between an id that is
// looked up and an id that decides what runs, and 2026-08-11 cost an hour to
// the difference between a strategy that lives in SMS and one that does not.
import * as copies from "../TMS/handouts/copies.mjs";
import * as liveReferences from "../TMS/handouts/live_references.mjs";

const HANDOUTS = Object.fromEntries(
  [copies, liveReferences].map((module) => [module.NAME, module]));

export function validate(record) {
  const problems = [];
  if (typeof record?.id !== "string" || !record.id) problems.push("id must be a non-empty string");
  if (!Array.isArray(record?.items)) problems.push("items must be an array");
  else {
    for (const [index, item] of record.items.entries()) {
      if (typeof item?.sku !== "string") problems.push(`items[${index}].sku must be a string`);
      if (!Number.isInteger(item?.qty) || item.qty < 1) problems.push(`items[${index}].qty must be a positive integer`);
    }
    const counted = record.items.reduce((sum, item) => sum + (item?.qty ?? 0), 0);
    if (record.total !== counted) problems.push(`total ${record.total} does not match the ${counted} item(s) listed`);
  }
  return problems;
}

export function resolveHandout(name) {
  const module = HANDOUTS[name];
  if (!module) {
    return { problem: `handout "${name}" has no implementation - fail closed (known: ${Object.keys(HANDOUTS).sort().join(", ")})` };
  }
  return { module };
}

export const handoutNames = () => Object.keys(HANDOUTS).sort();

export function openStore({ medium, handout }) {
  const { module, problem } = resolveHandout(handout);
  if (problem) return { problem };

  const policy = module.make(JSON.parse);
  const store = {
    handout,
    handsBack: module.HANDS_BACK,
    put(record) {
      const problems = validate(record);
      if (problems.length) return { written: false, problems };
      medium.write(record.id, JSON.stringify(record));
      policy.remember(record.id, record);
      return { written: true, problems: [] };
    },
    get(key) {
      const serialised = medium.read(key);
      if (serialised === null) return null;
      return policy.answer(serialised, key);
    },
    keys: () => medium.keys(),
  };
  return { store };
}

// The observation that separates the strategies, and the only cheap one.
// Every check written in terms of values passes under both.
export function handsOutCopies(store, key) {
  return store.get(key) !== store.get(key);
}

// The declaration a handout makes about itself, checked by running it rather
// than by reading it. Two labels agreeing is the mssp-d-003 shape.
export function mutationSurvives(makeStore, key, mutate) {
  const store = makeStore();
  mutate(store.get(key));
  return JSON.stringify(store.get(key));
}
