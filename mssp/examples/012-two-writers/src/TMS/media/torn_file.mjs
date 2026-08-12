// A medium that writes in two steps, and says so.
//
// It is here as the control. Without a medium whose atomicity claim is FALSE,
// the section that checks atomicity cannot come out badly - the same reason
// example 011 keeps a medium whose persistence claim is false.
import fs from "node:fs";
import path from "node:path";

export const MEDIUM = "torn-file";
export const GUARANTEES = [];

export function make({ dir }) {
  fs.mkdirSync(dir, { recursive: true });
  const file = (key) => path.join(dir, `${encodeURIComponent(key)}.json`);
  return {
    read: (key) => (fs.existsSync(file(key)) ? fs.readFileSync(file(key), "utf8") : null),
    // Two steps. Anything scheduled between them sees half a record.
    writeSteps: (key, value) => {
      const half = Math.ceil(value.length / 2);
      return [
        () => fs.writeFileSync(file(key), value.slice(0, half), "utf8"),
        () => fs.appendFileSync(file(key), value.slice(half), "utf8"),
      ];
    },
  };
}
