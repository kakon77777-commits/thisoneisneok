// Deserialise once and hand the same object back forever.
//
// Not a straw man: this is shelve.Shelf(writeback=True), which CPython ships
// and documents. What makes it legitimate there is that a caller who opened the
// file knows; what makes it a hazard is that whoever is handed the store does
// not - see archaeology 011.
export const NAME = "live-references";
export const HANDS_BACK = "the same object every read, retained in this process";
export const MUTATION_SURVIVES = true;

export function make(deserialise) {
  const cache = new Map();
  return {
    // shelve does exactly this on write when writeback is on: the object the
    // CALLER passed in becomes the cached one, so the store and the caller now
    // share it. That is what mutated a shared literal in this example's own test.
    remember(key, value) { cache.set(key, value); },
    answer(serialised, key) {
      if (!cache.has(key)) cache.set(key, deserialise(serialised));
      return cache.get(key);
    },
  };
}
