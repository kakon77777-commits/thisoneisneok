import assert from "node:assert/strict";
import test from "node:test";

// The rendered HTML must carry the build_id this build stamped — that is what
// scripts/verify-deploy.mjs matches against after deploying. A test asserting a
// constant string (as this one did against "codex-preview") would still pass if
// the stamp broke, so assert against the value on disk instead.
const { BUILD_ID } = await import("../app/data/build-id.generated.ts").catch(async () => {
  const source = await import("node:fs").then((fs) =>
    fs.readFileSync(new URL("../app/data/build-id.generated.ts", import.meta.url), "utf8"),
  );
  return { BUILD_ID: source.match(/BUILD_ID = "([^"]+)"/)[1] };
});

const buildIdMeta = new RegExp(
  `<meta(?=[^>]*\\bname=["']build-id["'])(?=[^>]*\\bcontent=["']${BUILD_ID}["'])[^>]*>`,
  "i",
);

test("renders the stamped build id", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  assert.match(await response.text(), buildIdMeta);
});
