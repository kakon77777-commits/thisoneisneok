// TMS — a second handler, structurally parallel to the first and unaware of it.

import { defineHandler } from "../../SMS/model.js";

export function httpGetHandler({ fetchUrl }) {
  return defineHandler({
    type: "http.get",
    async run(task) {
      const { status, bytes } = await fetchUrl(task.url);
      if (status >= 400) throw new Error(`HTTP ${status}`);
      return `${task.url}: ${status}, ${bytes} bytes`;
    },
  });
}
