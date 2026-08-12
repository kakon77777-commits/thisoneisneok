// A medium whose write is one step, because it writes elsewhere and renames.
//
// "Atomic" here is not a label: a write() returns the steps it takes, and this
// one returns exactly one. The island test interleaves INSIDE a write and finds
// there is no inside. A medium that claimed this and returned two steps would
// be caught by that, not by anyone reading this comment.
import fs from "node:fs";
import path from "node:path";

export const MEDIUM = "atomic-file";
export const GUARANTEES = ["atomic-replace"];

export function make({ dir }) {
  fs.mkdirSync(dir, { recursive: true });
  const file = (key) => path.join(dir, `${encodeURIComponent(key)}.json`);
  return {
    read: (key) => (fs.existsSync(file(key)) ? fs.readFileSync(file(key), "utf8") : null),
    // One step. The temporary file and the rename happen together or not at all.
    writeSteps: (key, value) => [() => {
      const staging = `${file(key)}.${process.pid}.tmp`;
      fs.writeFileSync(staging, value, "utf8");
      fs.renameSync(staging, file(key));
    }],
  };
}
