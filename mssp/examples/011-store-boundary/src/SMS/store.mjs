// The store: what a valid record is, and what the caller gets back.
//
// The medium is injected. The handout strategy is resolved by id, because 008
// cost a day to the difference between an id that is looked up and an id that
// decides what runs.

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

// Two ways to answer a read. Both satisfy every assertion about VALUES.
const HANDOUTS = {
  // Deserialise on every read. What the caller gets is theirs; mutating it
  // mutates a copy, and the store never sees it.
  copies: {
    hands_back: "a fresh object on every read",
    make() {
      return {
        remember() {},
        answer: (serialised) => JSON.parse(serialised),
      };
    },
  },
  // Deserialise once and hand the same object back forever. Mutations through
  // it are visible to later readers in this process and are never written.
  // This is not a straw man: it is shelve.Shelf with writeback=True, which is
  // an option CPython ships and documents.
  "live-references": {
    hands_back: "the same object every read, cached in this process",
    make() {
      const cache = new Map();
      return {
        // shelve.Shelf.__setitem__ does exactly this when writeback is on: the
        // object the CALLER passed in becomes the cached one, so the store and
        // the caller now share it.
        remember(key, value) { cache.set(key, value); },
        answer(serialised, key) {
          if (cache.has(key)) return cache.get(key);
          const value = JSON.parse(serialised);
          cache.set(key, value);
          return value;
        },
      };
    },
  },
};

export function resolveHandout(name) {
  const strategy = HANDOUTS[name];
  if (!strategy) {
    return { problem: `handout "${name}" has no implementation - fail closed (known: ${Object.keys(HANDOUTS).sort().join(", ")})` };
  }
  return { strategy };
}

export function openStore({ medium, handout }) {
  const { strategy, problem } = resolveHandout(handout);
  if (problem) return { problem };

  const policy = strategy.make();
  const store = {
    handout,
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

// The observation that separates the two strategies, and the only one that can.
// Every check written in terms of values passes under both.
export function handsOutCopies(store, key) {
  const first = store.get(key);
  const second = store.get(key);
  return first !== second;
}
