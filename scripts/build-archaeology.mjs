// Archaeology pipeline: mssp/archaeology/<id>/ -> public pages + site data.
//
// One open-source project a day. An entry is an analysis plus a runnable
// re-cut of one seam, so it carries the same obligations as an example — it must
// run, no TMS may import a sibling TMS, and the README must say what it did not
// solve — plus provenance.
//
// Provenance is not decoration. An archaeology that does not name the version it
// read stops being checkable the moment upstream changes, so project, licence
// and examined version are required and printed at the top of the page.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { renderMarkdown, countLeftoverRawMath } from "./lib/markdown-math.mjs";

const root = process.cwd();
const sourceDir = path.join(root, "mssp", "archaeology");
const publicDir = path.join(root, "public");
const siteUrl = "https://thisoneisneok.com";
const SETS = ["FMS", "SCL", "SMS", "TMS", "DMS"];

const problems = [];
const fail = (id, message) => problems.push(`${id}: ${message}`);

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
      if (!Array.isArray(meta[parent])) meta[parent] = [];
      meta[parent].push(value);
      continue;
    }
    const split = line.indexOf(":");
    if (split === -1) continue;
    const key = line.slice(0, split).trim();
    const value = line.slice(split + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!value) { parent = key; meta[key] = Array.isArray(meta[key]) ? meta[key] : {}; continue; }
    if (indented && parent && typeof meta[parent] === "object" && !Array.isArray(meta[parent])) {
      meta[parent][key] = value;
      continue;
    }
    meta[key] = value;
    parent = null;
  }
  return meta;
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const REQUIRED_SECTIONS = [
  { pattern: /^##\s+為什麼選它/m, name: "為什麼選它" },
  { pattern: /^##\s+原專案的結構地圖/m, name: "原專案的結構地圖" },
  { pattern: /^##\s+MSSP 重切/m, name: "MSSP 重切" },
  { pattern: /^##\s+什麼不適合拆/m, name: "什麼不適合拆" },
  { pattern: /^##\s+這次沒有解決什麼/m, name: "這次沒有解決什麼" },
];

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function checkTmsCoupling(id, dir, srcDir) {
  const tmsDir = path.join(srcDir, "TMS");
  if (!fs.existsSync(tmsDir)) return;
  const unitRootOf = (file) => {
    let unit = file;
    let cursor = path.dirname(file);
    while (cursor.startsWith(tmsDir)) {
      if (["index.js", "index.mjs", "index.ts"].some((n) => fs.existsSync(path.join(cursor, n)))) unit = cursor;
      cursor = path.dirname(cursor);
    }
    return unit;
  };
  for (const file of walk(tmsDir).filter((f) => /\.(js|mjs|ts)$/.test(f))) {
    const source = fs.readFileSync(file, "utf8");
    const selfUnit = unitRootOf(file);
    for (const match of source.matchAll(/^\s*import\s[^;]*?from\s+["']([^"']+)["']/gm)) {
      if (!match[1].startsWith(".")) continue;
      const resolved = path.resolve(path.dirname(file), match[1]);
      if (!resolved.startsWith(tmsDir + path.sep)) continue;
      if (unitRootOf(resolved) !== selfUnit) {
        fail(id, `TMS imports a sibling TMS: ${path.relative(dir, file).replaceAll("\\", "/")} -> ${match[1]}`);
      }
    }
  }
}

function page(meta, id, canonicalUrl, body, listing) {
  return `<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(meta.title.zh)} | MSSP 考古 | Neo.K</title>
<meta name="description" content="${escapeHtml(meta.summary.zh)}">
<link rel="canonical" href="${canonicalUrl}">
<link rel="stylesheet" href="/vendor/katex/katex.min.css">
<style>
:root{--paper:#f2efe8;--ink:#171914;--muted:#686b62;--line:#cbc8bf;--accent:#315b53}
*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font-family:Inter,"Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif}
header,main,footer{width:min(920px,calc(100% - 40px));margin:auto}
header{padding:34px 0 18px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;gap:20px;font:12px ui-monospace,monospace;letter-spacing:.08em;flex-wrap:wrap}
main{padding:52px 0 96px}
.prov{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:14px;border:1px solid var(--line);padding:20px;margin:0 0 44px}
.prov div{display:flex;flex-direction:column;gap:5px}
.prov b{color:var(--accent);font:9px ui-monospace,monospace;letter-spacing:.1em;text-transform:uppercase}
.prov span{font-size:13px;overflow-wrap:anywhere}.prov a{color:var(--accent)}
.content{font-size:17px;line-height:1.86;overflow-wrap:break-word}
.content h1{font-size:clamp(28px,4.6vw,44px);line-height:1.16;letter-spacing:-.04em;margin:4px 0 26px}
.content h2{font-size:24px;margin:52px 0 14px}.content h3{font-size:18px;margin:32px 0 10px}
.content p{margin:0 0 22px}.content li{margin:.4em 0}
.content table{border-collapse:collapse;width:100%;font-size:14px;margin:0 0 26px;display:block;overflow-x:auto}
.content th,.content td{border:1px solid var(--line);padding:8px 11px;text-align:left;vertical-align:top}
.content code{font-family:ui-monospace,monospace;font-size:.86em;background:#e2dfd6;padding:.15em .35em;border-radius:4px}
.content pre{background:#e6e3da;padding:16px;overflow-x:auto;font-size:13px;line-height:1.6;border-left:3px solid var(--accent)}
.content pre code{background:none;padding:0}
.content blockquote{margin:30px 0;padding:4px 0 4px 24px;border-left:3px solid var(--accent);color:var(--muted)}
.content a{color:var(--accent)}
.source{margin:64px 0 0;border-top:1px solid var(--line);padding-top:32px}
.set{margin:0 0 24px}.set h3{font:10px ui-monospace,monospace;letter-spacing:.14em;color:var(--accent);margin:0 0 10px}
details{border:1px solid var(--line);margin:0 0 6px}summary{cursor:pointer;padding:9px 13px;font:12px ui-monospace,monospace}
details[open] summary{border-bottom:1px solid var(--line)}details pre{margin:0;border-left:0;font-size:12.5px}
footer{border-top:1px solid var(--line);padding:24px 0 48px;display:flex;justify-content:space-between;gap:16px;font:12px ui-monospace,monospace;color:var(--muted);flex-wrap:wrap}
footer a{color:var(--accent)}
@media(max-width:640px){.content{font-size:16px}header,footer{flex-direction:column}}
</style>
</head>
<body>
<header><strong>NEO.K / MSSP 開源專案考古</strong><span>${escapeHtml(id)}</span></header>
<main>
  <section class="prov">
    <div><b>專案</b><span>${escapeHtml(meta.project)}</span></div>
    <div><b>授權</b><span>${escapeHtml(meta.license)}</span></div>
    <div><b>檢視版本</b><span>${escapeHtml(meta.examined_version)}</span></div>
    <div><b>日期</b><span>${escapeHtml(meta.date)}</span></div>
    ${meta.upstream ? `<div><b>來源</b><span><a href="${escapeHtml(meta.upstream)}">upstream ↗</a></span></div>` : ""}
  </section>
  <article class="content">${body}</article>
  <section class="source"><h2>重切原始碼</h2>${listing}</section>
</main>
<footer><span>分析內容 Apache-2.0；原專案授權見上方</span><a href="${siteUrl}/mssp">回到 MSSP 專區 ↗</a></footer>
</body>
</html>`;
}

if (!fs.existsSync(sourceDir)) {
  console.log("No mssp/archaeology directory yet — nothing to build.");
  process.exit(0);
}

const collected = [];
// Generated output directories are cleared before writing.
// Without this a renamed or deleted entry keeps its old file published forever:
// the stale asset is served ahead of any redirect the Worker would issue, so the
// rename silently does not take effect.
const htmlDir = path.join(publicDir, "html", "mssp", "archaeology");
fs.rmSync(htmlDir, { recursive: true, force: true });
fs.mkdirSync(htmlDir, { recursive: true });

for (const id of fs.readdirSync(sourceDir).sort()) {
  const dir = path.join(sourceDir, id);
  if (!fs.statSync(dir).isDirectory()) continue;

  const metaPath = path.join(dir, "meta.yaml");
  if (!fs.existsSync(metaPath)) { fail(id, "meta.yaml is missing"); continue; }
  const meta = readMeta(metaPath);

  for (const key of ["id", "project", "license", "examined_version", "title", "summary", "date", "verdict"]) {
    if (!meta[key]) fail(id, `meta.yaml is missing ${key}`);
  }
  if (meta.id !== id) fail(id, `meta.yaml id is "${meta.id}", which does not match the directory name`);

  const readmePath = path.join(dir, "README.md");
  if (!fs.existsSync(readmePath)) { fail(id, "README.md is missing"); continue; }
  const readme = fs.readFileSync(readmePath, "utf8");
  for (const section of REQUIRED_SECTIONS) {
    if (!section.pattern.test(readme)) fail(id, `README.md is missing a required section: ${section.name}`);
  }

  const srcDir = path.join(dir, "src");
  if (!fs.existsSync(srcDir)) { fail(id, "src/ is missing — an archaeology carries a runnable re-cut"); continue; }
  for (const set of SETS) {
    const setDir = path.join(srcDir, set);
    if (fs.existsSync(setDir) && walk(setDir).length === 0) fail(id, `src/${set}/ exists but is empty`);
  }
  checkTmsCoupling(id, dir, srcDir);

  if (meta.runnable) {
    const [command, ...args] = meta.runnable.split(/\s+/);
    try {
      execFileSync(command, args, { cwd: dir, stdio: "pipe", timeout: 60_000 });
    } catch (error) {
      fail(id, `runnable command failed: ${meta.runnable} — ${(error.stderr?.toString() || error.message).split("\n")[0]}`);
    }
  }

  const files = walk(srcDir).map((f) => path.relative(srcDir, f).replaceAll("\\", "/")).sort();
  const bySet = Object.fromEntries(
    [
      ...SETS.map((set) => [set, files.filter((f) => f.startsWith(`${set}/`))]),
      ["root", files.filter((f) => !SETS.some((set) => f.startsWith(`${set}/`)))],
    ].filter(([, list]) => list.length),
  );

  const body = renderMarkdown(readme);
  if (countLeftoverRawMath(body)) fail(id, "raw math delimiters survived rendering");

  const listing = Object.entries(bySet)
    .map(([set, list]) => `<section class="set"><h3>${set}</h3>${list
      .map((file) => `<details><summary>${escapeHtml(file)}</summary><pre><code>${escapeHtml(fs.readFileSync(path.join(srcDir, file), "utf8"))}</code></pre></details>`)
      .join("")}</section>`)
    .join("");

  const canonicalUrl = `${siteUrl}/html/mssp/archaeology/${id}.html`;
  fs.writeFileSync(path.join(htmlDir, `${id}.html`), page(meta, id, canonicalUrl, body, listing));

  collected.push({
    id,
    project: meta.project,
    license: meta.license,
    examinedVersion: meta.examined_version,
    upstream: meta.upstream ?? "",
    title: meta.title,
    summary: meta.summary,
    date: meta.date,
    verdict: meta.verdict,
    concepts: meta.concepts ?? [],
    lineCount: files.reduce((total, f) => total + fs.readFileSync(path.join(srcDir, f), "utf8").split("\n").length, 0),
    href: `/html/mssp/archaeology/${id}.html`,
    canonicalUrl,
  });
}

if (problems.length) {
  console.error("Archaeology contract violations:");
  for (const problem of problems) console.error(`  - ${problem}`);
  console.error("\nRefusing to publish. Fix the entry — do not relax the check.");
  process.exit(1);
}

collected.sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));

fs.writeFileSync(
  path.join(root, "app", "data", "mssp-archaeology.generated.ts"),
  `// Generated by scripts/build-archaeology.mjs. Do not edit by hand.\n` +
    `export const archaeology = ${JSON.stringify(collected, null, 2)};\n\n` +
    `export const archaeologyCount = ${collected.length};\n`,
);

fs.mkdirSync(path.join(publicDir, "ai"), { recursive: true });
fs.writeFileSync(
  path.join(publicDir, "ai", "archaeology-index.json"),
  JSON.stringify(
    {
      site: siteUrl,
      count: collected.length,
      note: "Open-source projects read structurally, one a day. Each entry names the exact version examined and ships a runnable re-cut of one seam.",
      entries: collected.map(({ id, project, license, examinedVersion, upstream, title, summary, date, verdict, canonicalUrl }) => ({
        id, project, license, examined_version: examinedVersion, upstream, title, summary, date, verdict, url: canonicalUrl,
      })),
    },
    null,
    2,
  ),
);

const sitemapPath = path.join(publicDir, "sitemap.xml");
if (fs.existsSync(sitemapPath) && collected.length) {
  const existing = fs.readFileSync(sitemapPath, "utf8");
  const entries = collected.map((entry) => `  <url><loc>${entry.canonicalUrl}</loc></url>`).join("\n");
  fs.writeFileSync(sitemapPath, existing.replace("</urlset>", `${entries}\n</urlset>`));
}

console.log(`Built ${collected.length} archaeology entr${collected.length === 1 ? "y" : "ies"}.`);
for (const entry of collected) {
  console.log(`  ${entry.id.padEnd(20)} ${entry.project}@${entry.examinedVersion} (${entry.license})  ${entry.lineCount} lines  verdict=${entry.verdict}`);
}
