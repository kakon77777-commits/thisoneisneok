// TMS — a second renderer, structurally parallel and unaware of the first.
//
// It exists to make the boundary real rather than theoretical: if the English
// renderer owned the phrasing, this file would have to import it, and the two
// would stop being separately loadable.

import { ERROR } from "../../SMS/parse.js";

export function chineseMessages() {
  return Object.freeze({
    name: "zh",
    render(result) {
      switch (result.code) {
        case ERROR.UNKNOWN_OPTION:
          return `無法辨識的選項 \`${result.detail.flag}'`;
        case ERROR.MISSING_OPTION_ARGUMENT:
          return result.detail.got
            ? `選項 \`${result.detail.flags}' 缺少參數，讀到的是 \`${result.detail.got}'`
            : `選項 \`${result.detail.flags}' 缺少參數`;
        case ERROR.MISSING_ARGUMENT:
          return `缺少必要參數 \`${result.detail.name}'`;
        default:
          return `解析失敗：${result.code}`;
      }
    },
  });
}
