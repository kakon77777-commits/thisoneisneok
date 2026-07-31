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

async function get(url) {
  const response = await fetch(url, {
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
        const response = await fetch(url, { method: "GET", redirect: "manual" });
        if (response.status !== 200) bad.push(`${url} -> ${response.status}${response.headers.get("location") ? ` -> ${response.headers.get("location")}` : ""}`);
      }
    }
    return [bad.length === 0, bad.length ? bad.join("; ") : `${samples.length * 2} URLs answer 200 directly (HTML + PDF, first and last of each series)`];
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
      const response = await fetch(`${baseUrl}/vendor/katex/fonts/${name}`, { method: "HEAD" });
      if (!response.ok) bad.push(`${name} -> ${response.status}`);
    }
    return [bad.length === 0 && fonts.length > 0, bad.length ? bad.join("; ") : `stylesheet references ${fonts.length} fonts, sampled ${Math.min(6, fonts.length)} — all present`];
  });

  await check("markdown sources NOT published", async () => {
    // Papers publish as HTML and PDF only. A /md/papers/ route appearing here
    // would mean the internal-source boundary broke.
    const response = await fetch(`${baseUrl}/md/papers/pldst-001.zh.md`);
    const alsoBare = await fetch(`${baseUrl}/md/papers/`);
    const leaked = response.status === 200 || alsoBare.status === 200;
    return [!leaked, `/md/papers probes -> ${response.status}, ${alsoBare.status}`];
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
