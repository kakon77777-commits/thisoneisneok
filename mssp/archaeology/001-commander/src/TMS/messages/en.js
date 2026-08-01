// TMS — one renderer for parse errors. Swappable, and unaware of any sibling.
//
// commander 2.20.3 embeds these strings at the point of failure, inside the same
// three lines that also write and exit. Pulling them into a TMS is what makes
// them translatable at all.

import { ERROR } from "../../SMS/parse.js";

export function englishMessages() {
  return Object.freeze({
    name: "en",
    render(result) {
      switch (result.code) {
        case ERROR.UNKNOWN_OPTION:
          return `unknown option \`${result.detail.flag}'`;
        case ERROR.MISSING_OPTION_ARGUMENT:
          return result.detail.got
            ? `option \`${result.detail.flags}' argument missing, got \`${result.detail.got}'`
            : `option \`${result.detail.flags}' argument missing`;
        case ERROR.MISSING_ARGUMENT:
          return `missing required argument \`${result.detail.name}'`;
        default:
          return `parse failed: ${result.code}`;
      }
    },
  });
}
