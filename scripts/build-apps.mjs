// Experimental apps pipeline: ingest/01-before/Apps -> public/apps/<slug>/.
//
// The source directory holds iterations, not distinct works: 39 files are 25
// apps. Which files belong together was decided from content and is recorded in
// experiments/manifest.json — filenames alone get it wrong in both directions
// (one app was renamed mid-lineage; two unrelated apps share a word).
//
// The check that matters here is coverage. A curation file is exactly the kind
// of thing that silently drifts from its source directory: a new file lands and
// nothing says so, or a rename leaves a `publish` pointing at nothing. Both fail
// the build.
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourceDir = path.join(root, "ingest", "01-before", "Apps");
const manifestPath = path.join(root, "experiments", "manifest.json");
const publicDir = path.join(root, "public");
// Published at /experiments/<slug>.html, not /apps/<slug>/.
//
// Two constraints rule out the directory form. `assets.html_handling` is "none"
// (papers publish canonical URLs that carry .html, and the default setting 307s
// those away), and that setting also disables directory-index resolution — so
// /apps/<slug>/ never resolves to its index.html. The request then falls through
// to the Worker, where the app router's own /apps/[slug] route answers with its
// "back to catalog" page. Both URLs returned 200 while serving the wrong
// document, which a status-code check cannot see.
const outDir = path.join(publicDir, "experiments");
const siteUrl = "https://thisoneisneok.com";

if (!fs.existsSync(manifestPath)) {
  console.log("No experiments/manifest.json — nothing to build.");
  process.exit(0);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const problems = [];
const fail = (message) => problems.push(message);

const sourceFiles = fs.existsSync(sourceDir)
  ? fs.readdirSync(sourceDir).filter((name) => fs.statSync(path.join(sourceDir, name)).isFile())
  : [];

const claimed = new Set();
const slugs = new Set();

for (const app of manifest.apps) {
  if (!app.slug || !/^[a-z0-9-]+$/.test(app.slug)) fail(`bad slug: ${app.slug}`);
  if (slugs.has(app.slug)) fail(`duplicate slug: ${app.slug}`);
  slugs.add(app.slug);

  for (const key of ["title", "summary", "date", "version", "publish", "history"]) {
    if (!app[key]) fail(`${app.slug}: missing ${key}`);
  }
  if (!Array.isArray(app.history) || app.history.length === 0) fail(`${app.slug}: history must be a non-empty list`);

  for (const file of app.history ?? []) {
    if (!sourceFiles.includes(file)) fail(`${app.slug}: history references a file that does not exist: ${file}`);
    if (claimed.has(file)) fail(`${app.slug}: ${file} is claimed by more than one app`);
    claimed.add(file);
  }

  // The published version has to be part of its own lineage — otherwise the
  // version count shown on the page describes a different app than the demo.
  if (app.publish && !app.history?.includes(app.publish)) {
    fail(`${app.slug}: publish "${app.publish}" is not listed in history`);
  }
  if (app.publish && !sourceFiles.includes(app.publish)) {
    fail(`${app.slug}: publish file does not exist: ${app.publish}`);
  }
}

// Every source file must belong to exactly one app. Without this, adding a file
// to the ingest folder would quietly do nothing and look like it worked.
for (const file of sourceFiles) {
  if (!claimed.has(file)) fail(`source file is in no app's history: ${file} — add it to experiments/manifest.json`);
}

// `related` must point at real slugs; a typo here produces a dead cross-link.
for (const app of manifest.apps) {
  for (const slug of app.related ?? []) {
    if (!slugs.has(slug)) fail(`${app.slug}: related slug does not exist: ${slug}`);
  }
}

if (problems.length) {
  console.error("Experiment manifest problems:");
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

// Several of these pages were authored inside a chat-artifact host and inherit
// its design tokens (--color-text-primary, --font-mono, --border-radius-md …).
// Outside that host the variables resolve to nothing, so text goes transparent
// and panels lose their background. Supplying them is what makes those apps
// look like themselves when served from this domain; the values follow the
// site's paper palette so they sit alongside everything else.
const HOST_TOKENS = `:root{
  --color-text-primary:#171914;
  --color-text-secondary:#55584f;
  --color-text-tertiary:#85887e;
  --color-text-info:#16728a;
  --color-text-success:#315b53;
  --color-text-warning:#a16e20;
  --color-background-primary:#f2efe8;
  --color-background-secondary:#e7e4dc;
  --color-background-tertiary:#dedbd2;
  --color-border-primary:rgba(23,25,20,.38);
  --color-border-secondary:rgba(23,25,20,.22);
  --color-border-tertiary:rgba(23,25,20,.14);
  --border-radius-sm:4px;
  --border-radius-md:8px;
  --border-radius-lg:12px;
  --font-sans:Inter,ui-sans-serif,-apple-system,"Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif;
  --font-mono:"SFMono-Regular",Consolas,"Liberation Mono",ui-monospace,monospace;
  --font-serif:"Noto Serif TC","Songti TC",Georgia,serif;
}
html,body{background:var(--color-background-primary);color:var(--color-text-primary);font-family:var(--font-sans)}
body{margin:0;padding:22px}`;

const PROVIDED_TOKENS = new Set([...HOST_TOKENS.matchAll(/\s(--[\w-]+)\s*:/g)].map((m) => m[1]));

// A CDN script is a functional dependency: if cdnjs is unreachable the page is
// blank, and the app's availability stops being a property of this site. Fonts
// are left alone — they degrade to a fallback face rather than to nothing — but
// a library gets vendored and rewritten. Same reasoning as self-hosting KaTeX.
const VENDORED_SCRIPTS = [
  {
    match: /https?:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\/r128\/three\.min\.js/g,
    local: "/vendor/three/three.min.js",
    file: "public/vendor/three/three.min.js",
  },
];

const isDocument = (source) => /<html|<!doctype/i.test(source);

/** Tokens a file reads but nothing in the file defines. */
function undefinedTokens(source) {
  const used = new Set([...source.matchAll(/var\(\s*(--[\w-]+)/g)].map((m) => m[1]));
  const defined = new Set([
    ...[...source.matchAll(/[{;]\s*(--[\w-]+)\s*:/g)].map((m) => m[1]),
    ...[...source.matchAll(/(?<!var\()\s(--[\w-]+)\s*:/g)].map((m) => m[1]),
  ]);
  return [...used].filter((token) => !defined.has(token));
}

function wrapFragment(source, title, description) {
  return `<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
<style>${HOST_TOKENS}</style>
</head>
<body>
${source}
</body>
</html>`;
}

const collected = [];
const externalDeps = [];
const treatments = [];
const vendorRewrites = [];

for (const app of manifest.apps) {
  const sourcePath = path.join(sourceDir, app.publish);
  let source = fs.readFileSync(sourcePath, "utf8");

  for (const vendored of VENDORED_SCRIPTS) {
    if (!vendored.match.test(source)) continue;
    vendored.match.lastIndex = 0;
    if (!fs.existsSync(path.join(root, vendored.file))) {
      fail(`${app.slug}: needs ${vendored.local} but ${vendored.file} is not present`);
      continue;
    }
    source = source.replace(vendored.match, vendored.local);
    vendorRewrites.push({ slug: app.slug, local: vendored.local });
  }

  // Third-party requests are recorded rather than rewritten. These are Neo's
  // pages and the typography is his; stripping a font link would change how his
  // work looks. Reporting them keeps the decision visible instead of implicit.
  const external = [
    ...source.matchAll(/<(?:script|link)[^>]+(?:src|href)=["'](https?:\/\/[^"']+)["']/g),
  ].map((match) => match[1]);
  const hosts = [...new Set(external.map((url) => new URL(url).host))];
  if (hosts.length) externalDeps.push({ slug: app.slug, hosts, urls: [...new Set(external)] });

  const missing = undefinedTokens(source);
  const unsupported = missing.filter((token) => !PROVIDED_TOKENS.has(token));
  // A token neither the file nor the shell defines would render as nothing —
  // transparent text, invisible borders. Fail rather than publish a page that
  // silently looks broken.
  if (unsupported.length) {
    fail(`${app.slug}: uses CSS variables nothing defines: ${unsupported.join(", ")} — add them to HOST_TOKENS or fix the source`);
  }

  let published = source;
  let treatment = "as-is";

  if (app.sourceOnly) {
    // Not a page: publishing it as index.html would serve a blank screen.
    fs.writeFileSync(path.join(outDir, `${app.slug}${path.extname(app.publish)}`), source);
    treatment = "source only";
  } else if (!isDocument(source)) {
    // A fragment: the browser will render it, but with no charset, no
    // viewport, and no host tokens. Wrap it into a real document.
    published = wrapFragment(source, app.title.zh, app.summary.zh.slice(0, 150));
    treatment = "wrapped";
    fs.writeFileSync(path.join(outDir, `${app.slug}.html`), published);
  } else if (missing.length) {
    // A full document that still reads host tokens: inject them ahead of the
    // page's own styles so its own rules keep winning.
    published = source.replace(/(<head[^>]*>)/i, `$1\n<style>${HOST_TOKENS}</style>`);
    if (published === source) published = `<style>${HOST_TOKENS}</style>\n${source}`;
    treatment = "tokens injected";
    fs.writeFileSync(path.join(outDir, `${app.slug}.html`), published);
  } else {
    fs.writeFileSync(path.join(outDir, `${app.slug}.html`), source);
  }
  if (treatment !== "as-is") treatments.push({ slug: app.slug, treatment, tokens: missing.length });

  collected.push({
    slug: app.slug,
    title: app.title,
    summary: app.summary,
    tags: app.tags ?? [],
    date: app.date,
    version: app.version,
    versionCount: app.history.length,
    related: app.related ?? [],
    note: app.note ?? "",
    sourceOnly: Boolean(app.sourceOnly),
    externalHosts: hosts,
    sizeKb: Math.round((source.length / 1024) * 10) / 10,
    href: app.sourceOnly ? `/experiments/${app.slug}${path.extname(app.publish)}` : `/experiments/${app.slug}.html`,
    canonicalUrl: app.sourceOnly
      ? `${siteUrl}/experiments/${app.slug}${path.extname(app.publish)}`
      : `${siteUrl}/experiments/${app.slug}.html`,
  });
}

if (problems.length) {
  console.error("Experiment build problems:");
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

collected.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));

fs.mkdirSync(path.join(root, "app", "data"), { recursive: true });
fs.writeFileSync(
  path.join(root, "app", "data", "apps.generated.ts"),
  `// Generated by scripts/build-apps.mjs from experiments/manifest.json.\n` +
    `// Do not edit by hand — edit the manifest.\n` +
    `export const experiments = ${JSON.stringify(collected, null, 2)};\n\n` +
    `export const experimentCount = ${collected.length};\n` +
    `export const experimentSourceFileCount = ${sourceFiles.length};\n`,
);

fs.mkdirSync(path.join(publicDir, "ai"), { recursive: true });
fs.writeFileSync(
  path.join(publicDir, "ai", "apps-index.json"),
  JSON.stringify(
    {
      site: siteUrl,
      count: collected.length,
      source_files: sourceFiles.length,
      note: "Experimental browser apps. Iterations are collapsed to the latest version; versionCount is how many iterations exist in the archive.",
      apps: collected.map(({ slug, title, summary, tags, date, version, versionCount, canonicalUrl, sourceOnly }) => ({
        slug, title, summary, tags, date, version, versions: versionCount, url: canonicalUrl, sourceOnly,
      })),
    },
    null,
    2,
  ),
);

const sitemapPath = path.join(publicDir, "sitemap.xml");
if (fs.existsSync(sitemapPath)) {
  const existing = fs.readFileSync(sitemapPath, "utf8");
  const entries = collected.filter((a) => !a.sourceOnly).map((a) => `  <url><loc>${a.canonicalUrl}</loc></url>`).join("\n");
  if (entries) fs.writeFileSync(sitemapPath, existing.replace("</urlset>", `${entries}\n</urlset>`));
}

console.log(`Built ${collected.length} apps from ${sourceFiles.length} source files.`);
const collapsed = collected.filter((a) => a.versionCount > 1);
console.log(`  ${collapsed.length} app(s) have multiple iterations: ${collapsed.map((a) => `${a.slug}(${a.versionCount})`).join(", ")}`);
if (externalDeps.length) {
  console.log(`  ${externalDeps.length} app(s) load third-party resources:`);
  for (const dep of externalDeps) console.log(`    ${dep.slug.padEnd(30)} ${dep.hosts.join(", ")}`);
}

if (treatments.length) {
  console.log(`  ${treatments.length} app(s) needed a document shell or host design tokens:`);
  for (const t of treatments) console.log(`    ${t.slug.padEnd(30)} ${t.treatment}${t.tokens ? ` (${t.tokens} tokens)` : ""}`);
}

if (vendorRewrites.length) {
  console.log(`  ${vendorRewrites.length} CDN script(s) rewritten to a self-hosted copy:`);
  for (const v of vendorRewrites) console.log(`    ${v.slug.padEnd(30)} ${v.local}`);
}
