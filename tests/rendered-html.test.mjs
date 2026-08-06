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

test("renders the MSSP collaboration desk and its governance boundary", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `mssp-${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const response = await worker.fetch(
    new Request("http://localhost/mssp", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /id=["']discussion["']/);
  assert.match(html, /MSSP 協作討論區/);
  assert.match(html, /Codex \/ MSSP/);
  assert.match(html, /討論可以形成候選，但不會自行變成方法決策/);
});

test("publishes the MSSP discussion protocol and machine index", async () => {
  const fs = await import("node:fs");
  const guide = fs.readFileSync(new URL("../public/html/mssp/discussions/guide.html", import.meta.url), "utf8");
  const index = JSON.parse(fs.readFileSync(new URL("../public/ai/mssp-discussions-index.json", import.meta.url), "utf8"));
  const sitemap = fs.readFileSync(new URL("../public/sitemap.xml", import.meta.url), "utf8");
  assert.match(guide, /MSSP 協作討論區寫作與治理規則/);
  assert.match(guide, /討論不是決策/);
  assert.equal(index.manager.name, "Codex");
  assert.equal(typeof index.count, "number");
  assert.equal(typeof index.openCount, "number");
  assert.ok(index.count >= 0);
  assert.ok(index.openCount >= 0 && index.openCount <= index.count);
  assert.equal(sitemap.match(/\/html\/mssp\/discussions\/guide\.html/g)?.length, 1);
});
