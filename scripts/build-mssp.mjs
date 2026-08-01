// MSSP examples pipeline: mssp/examples/<id>/ -> site data + standalone pages.
//
// This build is also the enforcement point for the method's own rules. A field
// lab that publishes examples violating the architecture it teaches is worse
// than publishing nothing, so the checks below fail the build rather than warn:
//
//   - every example runs (its `runnable` command must exit 0)
//   - no TMS module imports a sibling TMS
//   - no set directory is present but empty
//   - the README covers the sections the contract requires
//
// Contract: .claude/skills/mssp-scale/SMS/example-contract.md
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { renderMarkdown, countLeftoverRawMath } from "./lib/markdown-math.mjs";

const root = process.cwd();
const examplesDir = path.join(root, "mssp", "examples");
const publicDir = path.join(root, "public");
const siteUrl = "https://thisoneisneok.com";
const SETS = ["FMS", "SCL", "SMS", "TMS", "DMS"];

const problems = [];
function fail(id, message) {
  problems.push(`${id}: ${message}`);
}

/** Minimal YAML reader: flat keys, one level of nesting, and simple lists. */
function readMeta(file) {
  const meta = {};
  let parent = null;
  for (const raw of fs.readFileSync(file, "utf8").split("\n")) {
    if (!raw.trim() || raw.trimStart().startsWith("#")) continue;
    const indented = /^\s+/.test(raw);
    const line = raw.trim();

    if (line.startsWith("- ")) {
      const value = line.slice(2).trim().replace(/^['"]|['"]$/g, "");
      if (!parent) continue;
      // A bare "key:" is provisionally a map; the first "- " item is what
      // reveals it was a list all along.
      if (!Array.isArray(meta[parent])) meta[parent] = [];
      meta[parent].push(value);
      continue;
    }
    const split = line.indexOf(":");
    if (split === -1) continue;
    const key = line.slice(0, split).trim();
    const value = line.slice(split + 1).trim().replace(/^['"]|['"]$/g, "");

    if (!value) {
      parent = key;
      meta[key] = Array.isArray(meta[key]) ? meta[key] : {};
      continue;
    }
    if (indented && parent && typeof meta[parent] === "object" && !Array.isArray(meta[parent])) {
      meta[parent][key] = value;
      continue;
    }
    meta[key] = value;
    parent = null;
  }
  return meta;
}

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const REQUIRED_README_SECTIONS = [
  /^##\s+What this program does/m,
  /^##\s+The structural decision/m,
  /^##\s+The island test/m,
  /^##\s+What this example does not solve/m,
];

function checkExample(id, dir, meta) {
  const srcDir = path.join(dir, "src");
  if (!fs.existsSync(srcDir)) return fail(id, "src/ is missing");

  if (meta.id !== id) fail(id, `meta.yaml id is "${meta.id}", which does not match the directory name`);
  for (const key of ["title", "summary", "language", "date", "version", "kind"]) {
    if (!meta[key]) fail(id, `meta.yaml is missing ${key}`);
  }
  if (meta.kind && !["example", "counterexample"].includes(meta.kind)) {
    fail(id, `meta.yaml kind must be "example" or "counterexample", got "${meta.kind}"`);
  }

  // An empty set directory teaches nothing and implies structure that is not
  // there — the contract says create a set only when it has real content.
  for (const set of SETS) {
    const setDir = path.join(srcDir, set);
    if (fs.existsSync(setDir) && walk(setDir).length === 0) fail(id, `src/${set}/ exists but is empty`);
  }

  // The dependency rule, checked mechanically rather than by reading. This is
  // the one rule whose violation is invisible in review and fatal to the claim
  // that a TMS can be loaded alone.
  //
  // A TMS unit is: a directory under TMS/ containing an index file, or
  // otherwise a single file. Two files sitting in the same category directory
  // (TMS/reporters/text.js and TMS/reporters/json.js) are therefore two
  // separate units, and an import between them is a violation.
  //
  // The first version of this check treated same-directory imports as internal
  // and passed them. It was verified by adding the forbidden import on purpose:
  // the build stayed green, so the check could not have failed for the one case
  // it exists to catch.
  const tmsDir = path.join(srcDir, "TMS");
  if (fs.existsSync(tmsDir)) {
    const unitRootOf = (file) => {
      // Walk up to the highest ancestor under TMS/ that has an index file.
      let unit = file;
      let cursor = path.dirname(file);
      while (cursor.startsWith(tmsDir)) {
        const hasIndex = ["index.js", "index.mjs", "index.ts"].some((name) => fs.existsSync(path.join(cursor, name)));
        if (hasIndex) unit = cursor;
        cursor = path.dirname(cursor);
      }
      return unit;
    };

    for (const file of walk(tmsDir).filter((f) => /\.(js|mjs|ts)$/.test(f))) {
      const source = fs.readFileSync(file, "utf8");
      const selfUnit = unitRootOf(file);
      for (const match of source.matchAll(/^\s*import\s[^;]*?from\s+["']([^"']+)["']/gm)) {
        const specifier = match[1];
        if (!specifier.startsWith(".")) continue;
        const resolved = path.resolve(path.dirname(file), specifier);
        if (!resolved.startsWith(tmsDir + path.sep)) continue;
        if (unitRootOf(resolved) !== selfUnit) {
          fail(id, `TMS imports a sibling TMS: ${path.relative(dir, file).replaceAll("\\", "/")} -> ${specifier}`);
        }
      }
    }
  }

  const readmePath = path.join(dir, "README.md");
  if (!fs.existsSync(readmePath)) return fail(id, "README.md is missing");
  const readme = fs.readFileSync(readmePath, "utf8");
  for (const section of REQUIRED_README_SECTIONS) {
    if (!section.test(readme)) fail(id, `README.md is missing a required section: ${section.source.replace(/\^|\\s\+|\$|\/m/g, "").replace("##", "").trim()}`);
  }

  // "It runs" is the one claim every example makes implicitly. Check it.
  if (meta.runnable) {
    const [command, ...args] = meta.runnable.split(/\s+/);
    try {
      execFileSync(command, args, { cwd: dir, stdio: "pipe", timeout: 60_000 });
    } catch (error) {
      fail(id, `runnable command failed: ${meta.runnable} — ${(error.stderr?.toString() || error.message).split("\n")[0]}`);
    }
  }

  return readme;
}

if (!fs.existsSync(examplesDir)) {
  console.log("No mssp/examples directory yet — nothing to build.");
  process.exit(0);
}

const collected = [];
for (const id of fs.readdirSync(examplesDir).sort()) {
  const dir = path.join(examplesDir, id);
  if (!fs.statSync(dir).isDirectory()) continue;
  const metaPath = path.join(dir, "meta.yaml");
  if (!fs.existsSync(metaPath)) {
    fail(id, "meta.yaml is missing");
    continue;
  }
  const meta = readMeta(metaPath);
  const readme = checkExample(id, dir, meta);
  if (typeof readme !== "string") continue;

  const srcDir = path.join(dir, "src");
  const files = fs.existsSync(srcDir)
    ? walk(srcDir).map((f) => path.relative(srcDir, f).replaceAll("\\", "/")).sort()
    : [];
  // Files that belong to no set — the entry point and the island test — are
  // grouped under "root" rather than dropped. They are the two files a reader
  // most needs: one shows how the sets are wired together, the other is the
  // evidence for the example's central claim.
  const bySet = Object.fromEntries(
    [
      ...SETS.map((set) => [set, files.filter((f) => f.startsWith(`${set}/`))]),
      ["root", files.filter((f) => !SETS.some((set) => f.startsWith(`${set}/`)))],
    ].filter(([, list]) => list.length),
  );

  collected.push({
    id,
    slug: id,
    title: meta.title,
    summary: meta.summary,
    language: meta.language,
    date: meta.date,
    version: meta.version,
    kind: meta.kind,
    concepts: meta.concepts ?? [],
    runnable: meta.runnable ?? "",
    files,
    bySet,
    lineCount: files.reduce((total, f) => total + fs.readFileSync(path.join(srcDir, f), "utf8").split("\n").length, 0),
    canonicalUrl: `${siteUrl}/html/mssp/${id}.html`,
    htmlUrl: `${siteUrl}/html/mssp/${id}.html`,
    readme,
  });
}

if (problems.length) {
  console.error("MSSP example contract violations:");
  for (const problem of problems) console.error(`  - ${problem}`);
  console.error("\nRefusing to publish. Fix the example — do not relax the check.");
  process.exit(1);
}

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

// Generated output directories are cleared before writing.
// Without this a renamed or deleted entry keeps its old file published forever:
// the stale asset is served ahead of any redirect the Worker would issue, so the
// rename silently does not take effect.
const htmlDir = path.join(publicDir, "html", "mssp");
// Only the example pages live directly here; modules/ and archaeology/ are
// owned by their own steps, so they are preserved.
for (const name of fs.existsSync(htmlDir) ? fs.readdirSync(htmlDir) : []) {
  const full = path.join(htmlDir, name);
  if (fs.statSync(full).isFile()) fs.rmSync(full, { force: true });
}
fs.mkdirSync(htmlDir, { recursive: true });

for (const example of collected) {
  const body = renderMarkdown(example.readme);
  if (countLeftoverRawMath(body)) fail(example.id, "raw math delimiters survived rendering");
  const srcDir = path.join(examplesDir, example.id, "src");
  const listing = Object.entries(example.bySet)
    .map(([set, list]) => `<section class="set"><h3>${set}</h3>${list
      .map((file) => {
        const source = fs.readFileSync(path.join(srcDir, file), "utf8");
        return `<details><summary>${escapeHtml(file)}</summary><pre><code>${escapeHtml(source)}</code></pre></details>`;
      })
      .join("")}</section>`)
    .join("");

  fs.writeFileSync(
    path.join(htmlDir, `${example.id}.html`),
    `<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(example.title.zh || example.id)} | MSSP | Neo.K</title>
<meta name="description" content="${escapeHtml(example.summary.zh || "")}">
<link rel="canonical" href="${example.canonicalUrl}">
<link rel="stylesheet" href="/vendor/katex/katex.min.css">
<style>
:root{--paper:#f2efe8;--ink:#171914;--muted:#686b62;--line:#cbc8bf;--accent:#315b53}
*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font-family:Inter,"Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif}
header,main,footer{width:min(920px,calc(100% - 40px));margin:auto}
header{padding:34px 0 18px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;gap:20px;font:12px ui-monospace,monospace;letter-spacing:.08em;flex-wrap:wrap}
main{padding:52px 0 96px}
.facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:14px;border:1px solid var(--line);padding:20px;margin:0 0 44px}
.facts div{display:flex;flex-direction:column;gap:5px}.facts b{color:var(--accent);font:9px ui-monospace,monospace;letter-spacing:.1em;text-transform:uppercase}.facts span{font-size:13px}
.warn{border:1px solid #a3322b;color:#a3322b;padding:14px 18px;margin:0 0 32px;font-size:14px}
.content{font-size:17px;line-height:1.85;overflow-wrap:break-word}
.content h1{font-size:clamp(30px,5vw,48px);line-height:1.12;letter-spacing:-.04em;margin:6px 0 28px}
.content h2{font-size:24px;margin:52px 0 14px}.content h3{font-size:18px;margin:32px 0 10px}
.content p{margin:0 0 22px}.content li{margin:.4em 0}
.content code{font-family:ui-monospace,monospace;font-size:.86em;background:#e2dfd6;padding:.15em .35em;border-radius:4px}
.content pre{background:#e6e3da;padding:16px;overflow-x:auto;font-size:13px;line-height:1.6;border-left:3px solid var(--accent)}
.content pre code{background:none;padding:0}
.content blockquote{margin:32px 0;padding:4px 0 4px 24px;border-left:3px solid var(--accent);color:var(--muted)}
.content a{color:var(--accent)}
.source{margin:64px 0 0;border-top:1px solid var(--line);padding-top:34px}
.set{margin:0 0 26px}.set h3{font:10px ui-monospace,monospace;letter-spacing:.14em;color:var(--accent);margin:0 0 10px}
details{border:1px solid var(--line);margin:0 0 6px}
summary{cursor:pointer;padding:9px 13px;font:12px ui-monospace,monospace}
details[open] summary{border-bottom:1px solid var(--line)}
details pre{margin:0;border-left:0;font-size:12.5px}
footer{border-top:1px solid var(--line);padding:24px 0 48px;display:flex;justify-content:space-between;gap:16px;font:12px ui-monospace,monospace;color:var(--muted);flex-wrap:wrap}
footer a{color:var(--accent)}
@media(max-width:640px){.content{font-size:16px}header,footer{flex-direction:column}}
</style>
</head>
<body>
<header><strong>NEO.K / MSSP FIELD LAB</strong><span>${escapeHtml(example.id)}</span></header>
<main>
  ${example.kind === "counterexample" ? `<p class="warn">反例（counterexample）：這個範例刻意示範錯誤結構，不要照抄。</p>` : ""}
  <section class="facts">
    <div><b>編號</b><span>${escapeHtml(example.id)}</span></div>
    <div><b>語言</b><span>${escapeHtml(example.language)}</span></div>
    <div><b>版本</b><span>${escapeHtml(example.version)}</span></div>
    <div><b>日期</b><span>${escapeHtml(example.date)}</span></div>
    <div><b>行數</b><span>${example.lineCount}</span></div>
    ${example.runnable ? `<div><b>執行</b><span><code>${escapeHtml(example.runnable)}</code></span></div>` : ""}
  </section>
  <article class="content">${body}</article>
  <section class="source"><h2>Source</h2>${listing}</section>
</main>
<footer><span>Neo.K × EveMissLab · Apache-2.0</span><a href="${siteUrl}/mssp">回到 MSSP 專區 ↗</a></footer>
</body>
</html>`,
  );
}

if (problems.length) {
  console.error("MSSP rendering problems:");
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

// ---- the field-manual modules ----
//
// Kept as Markdown next to the examples rather than as JSX, so a module can be
// edited without touching the site, and so its state label is written where the
// content is. The label is data: "尚未開始" appears on the page because module 03
// says so, not because someone remembered to update a component.
const moduleDir = path.join(root, "mssp", "modules");
const modules = [];

if (fs.existsSync(moduleDir)) {
  const moduleHtmlDir = path.join(publicDir, "html", "mssp", "modules");
  fs.rmSync(moduleHtmlDir, { recursive: true, force: true });
  fs.mkdirSync(moduleHtmlDir, { recursive: true });

  for (const filename of fs.readdirSync(moduleDir).filter((name) => name.endsWith(".md")).sort()) {
    const source = fs.readFileSync(path.join(moduleDir, filename), "utf8");
    if (!source.startsWith("---\n")) {
      fail(filename, "module is missing frontmatter");
      continue;
    }
    const end = source.indexOf("\n---\n", 4);
    const meta = {};
    for (const line of source.slice(4, end).split("\n")) {
      const split = line.indexOf(":");
      if (split === -1) continue;
      meta[line.slice(0, split).trim()] = line.slice(split + 1).trim().replace(/^['"]|['"]$/g, "");
    }
    for (const key of ["id", "index", "title_zh", "title_en", "summary_zh", "summary_en", "state_zh", "state_en", "updated"]) {
      if (!meta[key]) fail(filename, `module frontmatter is missing ${key}`);
    }

    const body = renderMarkdown(source.slice(end + 5));
    if (countLeftoverRawMath(body)) fail(filename, "raw math delimiters survived rendering");

    const canonicalUrl = `${siteUrl}/html/mssp/modules/${meta.id}.html`;
    fs.writeFileSync(
      path.join(moduleHtmlDir, `${meta.id}.html`),
      `<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(meta.title_zh)} | MSSP | Neo.K</title>
<meta name="description" content="${escapeHtml(meta.summary_zh)}">
<link rel="canonical" href="${canonicalUrl}">
<link rel="stylesheet" href="/vendor/katex/katex.min.css">
<style>
:root{--paper:#f2efe8;--ink:#171914;--muted:#686b62;--line:#cbc8bf;--accent:#315b53}
*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font-family:Inter,"Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif}
header,main,footer{width:min(880px,calc(100% - 40px));margin:auto}
header{padding:34px 0 18px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;gap:20px;font:12px ui-monospace,monospace;letter-spacing:.08em;flex-wrap:wrap}
main{padding:52px 0 96px}
.state{display:inline-block;border:1px solid var(--accent);color:var(--accent);font:9px ui-monospace,monospace;letter-spacing:.12em;padding:5px 10px;margin:0 0 30px;text-transform:uppercase}
.content{font-size:17.5px;line-height:1.9;overflow-wrap:break-word}
.content h1{font-size:clamp(32px,5.4vw,54px);line-height:1.1;letter-spacing:-.04em;margin:4px 0 32px}
.content h2{font-size:25px;line-height:1.3;margin:56px 0 15px}
.content h3{font-size:18px;margin:34px 0 11px}
.content p{margin:0 0 23px}.content li{margin:.42em 0}
.content strong{font-weight:650}
.content blockquote{margin:34px 0;padding:6px 0 6px 26px;border-left:3px solid var(--accent);font-size:19px;line-height:1.7}
.content code{font-family:ui-monospace,monospace;font-size:.85em;background:#e2dfd6;padding:.15em .35em;border-radius:4px}
.content pre{background:#e6e3da;padding:16px;overflow-x:auto;font-size:13px;line-height:1.62;border-left:3px solid var(--accent)}
.content pre code{background:none;padding:0}
.content a{color:var(--accent)}
.content hr{border:0;border-top:1px solid var(--line);margin:44px 0}
.content .katex-display{overflow-x:auto;overflow-y:hidden;padding:6px 0;margin:26px 0}
footer{border-top:1px solid var(--line);padding:24px 0 48px;display:flex;justify-content:space-between;gap:16px;font:12px ui-monospace,monospace;color:var(--muted);flex-wrap:wrap}
footer a{color:var(--accent)}
@media(max-width:640px){.content{font-size:16px}header,footer{flex-direction:column}}
</style>
</head>
<body>
<header><strong>NEO.K / MSSP FIELD MANUAL</strong><span>${escapeHtml(meta.index)} · ${escapeHtml(meta.updated)}</span></header>
<main>
  <span class="state">${escapeHtml(meta.state_zh)}</span>
  <article class="content">${body}</article>
</main>
<footer><span>Neo.K × EveMissLab · Apache-2.0</span><a href="${siteUrl}/mssp">回到 MSSP 專區 ↗</a></footer>
</body>
</html>`,
    );

    modules.push({
      id: meta.id,
      index: meta.index,
      title: { zh: meta.title_zh, en: meta.title_en },
      summary: { zh: meta.summary_zh, en: meta.summary_en },
      state: { zh: meta.state_zh, en: meta.state_en },
      updated: meta.updated,
      href: `/html/mssp/modules/${meta.id}.html`,
      canonicalUrl,
    });
  }
}

if (problems.length) {
  console.error("MSSP module problems:");
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

fs.mkdirSync(path.join(root, "app", "data"), { recursive: true });
fs.writeFileSync(
  path.join(root, "app", "data", "mssp-modules.generated.ts"),
  `// Generated by scripts/build-mssp.mjs from mssp/modules/*.md. Do not edit by hand.\n` +
    `export const msspModules = ${JSON.stringify(modules, null, 2)};\n`,
);

fs.writeFileSync(
  path.join(root, "app", "data", "mssp.generated.ts"),
  `// Generated by scripts/build-mssp.mjs. Do not edit by hand.\n` +
    `export const msspExamples = ${JSON.stringify(
      collected.map(({ readme, ...rest }) => { void readme; return rest; }),
      null,
      2,
    )};\n\nexport const msspExampleCount = ${collected.length};\n`,
);

fs.mkdirSync(path.join(publicDir, "ai"), { recursive: true });
fs.writeFileSync(
  path.join(publicDir, "ai", "mssp-index.json"),
  JSON.stringify(
    {
      site: siteUrl,
      count: collected.length,
      note: "MSSP architecture examples. Each entry runs, and each is checked for TMS-to-TMS coupling at build time.",
      examples: collected.map(({ id, title, summary, language, date, version, kind, concepts, runnable, htmlUrl, lineCount }) => ({
        id, title, summary, language, date, version, kind, concepts, runnable, html: htmlUrl, lines: lineCount,
      })),
    },
    null,
    2,
  ),
);

const sitemapPath = path.join(publicDir, "sitemap.xml");
if (fs.existsSync(sitemapPath)) {
  const existing = fs.readFileSync(sitemapPath, "utf8");
  const entries = collected.map((e) => `  <url><loc>${e.htmlUrl}</loc></url>`).join("\n");
  if (entries) fs.writeFileSync(sitemapPath, existing.replace("</urlset>", `${entries}\n</urlset>`));
}

console.log(`Built ${collected.length} MSSP example(s) and ${modules.length} field-manual module(s).`);
for (const m of modules) console.log(`  ${m.index} ${m.id.padEnd(14)} ${m.state.zh}`);
for (const example of collected) {
  console.log(`  ${example.id.padEnd(22)} ${example.language.padEnd(11)} ${example.lineCount} lines, ${example.files.length} files${example.kind === "counterexample" ? "  [COUNTEREXAMPLE]" : ""}`);
}
