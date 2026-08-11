// A medium that is one file per record on disk.
//
// It imports node:fs, which is the whole point of it - the island rule this
// lab enforces is that a TMS unit must not reach a SIBLING TMS, not that it
// must be import-free. A medium with no way to touch its medium is not one.
import fs from "node:fs";
import path from "node:path";

export const MEDIUM = "json-dir";
export const PERSISTS_ACROSS_PROCESSES = true;

const fileFor = (dir, key) => path.join(dir, `${encodeURIComponent(key)}.json`);

export function make({ dir }) {
  fs.mkdirSync(dir, { recursive: true });
  return {
    read: (key) => {
      const file = fileFor(dir, key);
      return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
    },
    write: (key, serialised) => { fs.writeFileSync(fileFor(dir, key), serialised, "utf8"); },
    keys: () => fs.readdirSync(dir).filter((n) => n.endsWith(".json"))
      .map((n) => decodeURIComponent(n.slice(0, -5))).sort(),
  };
}
