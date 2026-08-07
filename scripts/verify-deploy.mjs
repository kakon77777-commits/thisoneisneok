// Post-deploy consistency gate.
//
// Run AFTER `wrangler deploy`, which must itself follow a fresh build. Compares
// the LIVE site against public/ai/build-id.json — the ground truth this build
// wrote — on both the build_id and the counts it implies.
//
// `wrangler deploy` printing success does NOT mean the deploy is live: edge
// caches lag, and a stale asset set can still answer with plausible-looking
// numbers. Only a matching build_id proves the bytes now being served are the
// bytes this build produced. Exits non-zero on mismatch — that means "do not
// report this deploy as done".
//
// Usage: node scripts/verify-deploy.mjs [--base-url https://...] [--retries 6] [--delay 5]
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
function arg(name, fallback) {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? fallback : args[index + 1];
}
const baseUrl = (arg("base-url", "https://thisoneisneok.com")).replace(/\/$/, "");
const retries = Number(arg("retries", 6));
const delay = Number(arg("delay", 5)) * 1000;

const truthPath = path.join(process.cwd(), "public", "ai", "build-id.json");
if (!fs.existsSync(truthPath)) {
  console.error("[verify] public/ai/build-id.json missing — run scripts/stamp-build.mjs then build.");
  process.exit(2);
}
const truth = JSON.parse(fs.readFileSync(truthPath, "utf8"));

// A `Cache-Control: no-cache` request header does not reliably bypass a CDN edge
// cache, so every probe carries a unique query string. Without it this gate can
// pass against a copy the previous deploy left behind — which happened: a stale
// /ai/apps-index.json listed the old app URLs long enough to make 25 working
// pages look like 25 redirects.
let probe = 0;
const bust = (url) => `${url}${url.includes("?") ? "&" : "?"}__v=${Date.now().toString(36)}${(probe += 1)}`;

async function get(url) {
  const response = await fetch(bust(url), {
    headers: { "User-Agent": "verify-deploy/1.0", "Cache-Control": "no-cache" },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response;
}

const BUILD_META = /name="build-id"\s+content="([^"]*)"/;

async function onePass() {
  const results = [];
  const check = async (name, fn) => {
    try {
      const [ok, detail] = await fn();
      results.push([name, ok, detail]);
    } catch (error) {
      results.push([name, false, `fetch/parse error: ${error.message}`]);
    }
  };

  await check("build-id.json", async () => {
    const live = await (await get(`${baseUrl}/ai/build-id.json`)).json();
    const ok = live.build_id === truth.build_id && live.paper_count === truth.paper_count;
    return [ok, `build_id=${live.build_id} (want ${truth.build_id}), papers=${live.paper_count} (want ${truth.paper_count})`];
  });

  await check("homepage build-id meta", async () => {
    const html = await (await get(`${baseUrl}/`)).text();
    const found = html.match(BUILD_META)?.[1] ?? null;
    return [found === truth.build_id, `meta build-id=${found} (want ${truth.build_id})`];
  });

  await check("/papers build-id meta", async () => {
    const html = await (await get(`${baseUrl}/papers`)).text();
    const found = html.match(BUILD_META)?.[1] ?? null;
    return [found === truth.build_id, `meta build-id=${found} (want ${truth.build_id})`];
  });

  await check("papers-index.json count", async () => {
    const live = await (await get(`${baseUrl}/ai/papers-index.json`)).json();
    const listed = live.series.reduce((total, series) => total + series.papers.length, 0);
    return [live.count === truth.paper_count && listed === truth.paper_count, `count=${live.count}, listed=${listed} (want ${truth.paper_count})`];
  });

  // Both published formats must answer 200 AT the canonical URL — no redirect.
  //
  // This check used to follow redirects, and so passed while every .html URL was
  // 307ing to its extensionless form: the URL in the sitemap, in
  // papers-index.json, and in each page's own <link rel="canonical"> was not the
  // URL actually serving the page. `redirect: "manual"` is what makes a 3xx
  // visible instead of silently resolved.
  await check("published formats reachable, no redirect", async () => {
    const live = await (await get(`${baseUrl}/ai/papers-index.json`)).json();
    const samples = live.series.flatMap((series) => [series.papers[0], series.papers.at(-1)]).filter(Boolean);
    const bad = [];
    for (const paper of samples) {
      for (const url of [paper.html, paper.pdf]) {
        const response = await fetch(bust(url), { method: "GET", redirect: "manual" });
        if (response.status !== 200) bad.push(`${url} -> ${response.status}${response.headers.get("location") ? ` -> ${response.headers.get("location")}` : ""}`);
      }
    }
    return [bad.length === 0, bad.length ? bad.join("; ") : `${samples.length * 2} URLs answer 200 directly (HTML + PDF, first and last of each series)`];
  });

  // A page has one top-level heading: its title. 81 of the 89 papers number
  // their sections `# 1.` `# 2.`, and the pipeline emitted the title as an H1
  // and then rendered those beneath it — 2,433 section headings across the
  // corpus set at the title's 54px, while the `## 摘要` above them sat at 26.
  // The hierarchy came out inverted and shipped that way from the first deploy.
  //
  // Every gate here was green throughout, because they counted formulas,
  // delimiters, redirects and bytes. None of them looked at whether the page
  // reads as a document. This one does, in the one respect that can be stated
  // as a number.
  await check("one top-level heading per paper", async () => {
    const live = await (await get(`${baseUrl}/ai/papers-index.json`)).json();
    const samples = live.series.flatMap((series) => [series.papers[0], series.papers.at(-1)]).filter(Boolean);
    const bad = [];
    for (const paper of samples) {
      const html = await (await get(paper.html)).text();
      const body = html.slice(html.indexOf('<article class="content">'));
      const count = (body.match(/<h1[ >]/g) || []).length;
      if (count !== 1) bad.push(`${paper.id}: ${count} H1`);
    }
    return [bad.length === 0, bad.length ? bad.join("; ") : `${samples.length} sampled papers each carry exactly one H1`];
  });

  // Notation must reach the reader as typeset symbols, not as source. Both
  // halves matter: KaTeX output present, AND no surviving `$$` — the build
  // metric "17,161 formulas rendered" was green while two papers still showed a
  // raw \boxed{...} on the page.
  await check("math typeset, not raw LaTeX", async () => {
    const live = await (await get(`${baseUrl}/ai/papers-index.json`)).json();
    const samples = live.series.map((series) => series.papers[0]).filter(Boolean);
    const problems = [];
    let typeset = 0;
    for (const paper of samples) {
      const html = await (await get(paper.html)).text();
      const rendered = (html.match(/class="katex/g) || []).length;
      const raw = (html.match(/\$\$/g) || []).length;
      typeset += rendered;
      if (rendered === 0) problems.push(`${paper.id}: no typeset math`);
      if (raw > 0) problems.push(`${paper.id}: ${raw} raw delimiter(s)`);
    }
    return [problems.length === 0, problems.length ? problems.join("; ") : `${typeset} typeset formulas across ${samples.length} sampled papers, 0 raw delimiters`];
  });

  await check("KaTeX fonts self-hosted", async () => {
    // The stylesheet is useless if its fonts 404 — the page would silently fall
    // back to system glyphs and the notation would look wrong rather than broken.
    const css = await (await get(`${baseUrl}/vendor/katex/katex.min.css`)).text();
    const fonts = [...new Set([...css.matchAll(/url\(fonts\/([^)]+?)\)/g)].map((match) => match[1]))];
    const bad = [];
    for (const name of fonts.slice(0, 6)) {
      const response = await fetch(bust(`${baseUrl}/vendor/katex/fonts/${name}`), { method: "HEAD" });
      if (!response.ok) bad.push(`${name} -> ${response.status}`);
    }
    return [bad.length === 0 && fonts.length > 0, bad.length ? bad.join("; ") : `stylesheet references ${fonts.length} fonts, sampled ${Math.min(6, fonts.length)} — all present`];
  });

  // Each experiment must serve its OWN document — not the app shell.
  //
  // This check exists because status codes could not see the failure it was
  // written for: /apps/<slug>/ answered 200 with the router's "back to catalog"
  // page, because html_handling "none" disables directory-index resolution and
  // the request fell through to the Worker's /apps/[slug] route. Every URL
  // looked healthy. The tell was that four different apps all returned exactly
  // 5,968 bytes. So: compare the served <title> against the manifest's, and
  // reject anything carrying the shell's build-id meta.
  await check("experiments serve their own document", async () => {
    const live = await (await get(`${baseUrl}/ai/apps-index.json`)).json();
    const runnable = live.apps.filter((app) => !app.sourceOnly);
    const sample = [runnable[0], runnable[Math.floor(runnable.length / 2)], runnable.at(-1)].filter(Boolean);
    const bad = [];
    for (const app of sample) {
      const response = await fetch(bust(app.url), { redirect: "manual" });
      if (response.status !== 200) {
        bad.push(`${app.slug} -> ${response.status}`);
        continue;
      }
      const html = await response.text();
      if (BUILD_META.test(html)) {
        bad.push(`${app.slug} served the site shell, not the app`);
        continue;
      }
      const title = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ?? "";
      // The wrapped fragments get their title from the manifest; the rest keep
      // their own. Either way an app's title must not be the site's.
      if (!title || /Neo\.K × EveMissLab/.test(title)) bad.push(`${app.slug} title looks wrong: "${title}"`);
    }
    return [bad.length === 0, bad.length ? bad.join("; ") : `${sample.length} sampled apps serve their own document`];
  });

  await check("MSSP collaboration desk and protocol are live", async () => {
    const [pageResponse, guideResponse, indexResponse] = await Promise.all([
      get(`${baseUrl}/mssp`),
      get(`${baseUrl}/html/mssp/discussions/guide.html`),
      get(`${baseUrl}/ai/mssp-discussions-index.json`),
    ]);
    const page = await pageResponse.text();
    const guide = await guideResponse.text();
    const index = await indexResponse.json();
    const problems = [];
    if (!/id=["']discussion["']/.test(page) || !page.includes("MSSP 協作討論區")) problems.push("desk missing from /mssp");
    if (!guide.includes("討論不是決策")) problems.push("protocol page is not the collaboration guide");
    if (index.manager?.name !== "Codex") problems.push(`manager=${index.manager?.name ?? "missing"}`);

    // The thread count was printed but not asserted, so a desk that had lost
    // every thread would have reported "0 thread(s)" and passed — and on
    // 2026-08-07 it did print 0 while the artifact being deployed carried one,
    // which is propagation rather than loss but is indistinguishable from it
    // here. Compare against the tree this deploy was built from: local is the
    // claim, live is the observation, and they have to agree.
    const localIndexPath = path.join(process.cwd(), "public", "ai", "mssp-discussions-index.json");
    if (fs.existsSync(localIndexPath)) {
      const local = JSON.parse(fs.readFileSync(localIndexPath, "utf8"));
      if (index.count !== local.count) {
        problems.push(`live has ${index.count} thread(s), this build has ${local.count}`);
      }
      const liveIds = (index.discussions ?? []).map((thread) => thread.id).sort().join(",");
      const localIds = (local.discussions ?? []).map((thread) => thread.id).sort().join(",");
      if (liveIds !== localIds) problems.push(`live threads [${liveIds}] != built [${localIds}]`);
    } else {
      problems.push("no locally built discussion index to compare against");
    }

    return [problems.length === 0, problems.length ? problems.join("; ")
      : `${index.count} thread(s) matching this build, manager=Codex, governance boundary present`];
  });

  // Three formats from one source, and the third one is the source. This check
  // used to assert the exact opposite — that /md/papers must NOT resolve —
  // because papers originally published as HTML and PDF only. When the policy
  // changed, a check written to enforce the old policy would have failed the
  // deploy and looked like a bug in the new work. Inverting it deliberately is
  // part of changing the policy, not an afterthought.
  await check("markdown source published alongside each paper", async () => {
    const live = await (await get(`${baseUrl}/ai/papers-index.json`)).json();
    const samples = live.series.flatMap((series) => [series.papers[0], series.papers.at(-1)]).filter(Boolean);
    const bad = [];
    for (const paper of samples) {
      if (!paper.markdown) {
        bad.push(`${paper.id}: index lists no markdown URL`);
        continue;
      }
      const response = await fetch(bust(paper.markdown), { redirect: "manual" });
      if (response.status !== 200) {
        bad.push(`${paper.markdown} -> ${response.status}`);
        continue;
      }
      const text = await response.text();
      // A Markdown URL answering with the site's HTML shell would be worse than
      // a 404: it looks like a working download and delivers the wrong bytes.
      if (/^\s*<!doctype html/i.test(text) || BUILD_META.test(text)) bad.push(`${paper.id}: markdown URL served HTML`);
      else if (text.length < 500) bad.push(`${paper.id}: markdown is only ${text.length} bytes`);
    }
    return [bad.length === 0, bad.length ? bad.join("; ") : `${samples.length} sampled papers serve their Markdown source directly`];
  });

  return results;
}

console.log(`[verify] local truth: build_id=${truth.build_id} papers=${truth.paper_count} posts=${truth.post_count}`);
console.log(`[verify] checking ${baseUrl} ...`);

let last = [];
for (let attempt = 1; attempt <= retries; attempt += 1) {
  last = await onePass();
  if (last.every(([, ok]) => ok)) {
    console.log(`[verify] PASS on attempt ${attempt}/${retries}`);
    for (const [name, , detail] of last) console.log(`  [OK]   ${name} — ${detail}`);
    console.log(`\n[verify] build ${truth.build_id} is fully live across every surface checked.`);
    process.exit(0);
  }
  if (attempt < retries) {
    const failed = last.filter(([, ok]) => !ok).length;
    console.log(`[verify] attempt ${attempt}/${retries}: ${failed} check(s) failed — retrying in ${delay / 1000}s (edge cache may lag) ...`);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}

console.log(`\n[verify] FAIL after ${retries} attempts — deployment is NOT consistent:`);
for (const [name, ok, detail] of last) console.log(`  [${ok ? "OK  " : "FAIL"}] ${name} — ${detail}`);
console.log(`\n[verify] Do not report this deploy as complete.`);
process.exit(1);
