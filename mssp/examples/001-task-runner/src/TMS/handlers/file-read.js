// TMS — one handler, for one task type.
//
// Imports only from SMS. It does not know that an http handler exists, and
// nothing breaks if that handler is absent.

import { defineHandler } from "../../SMS/model.js";

export function fileReadHandler({ readFile }) {
  // The tool arrives by injection rather than by importing node:fs directly.
  // That is what lets the island test run this module with a stub and no disk.
  return defineHandler({
    type: "file.read",
    async run(task) {
      const text = await readFile(task.path);
      return `${task.path}: ${text.length} chars`;
    },
  });
}
