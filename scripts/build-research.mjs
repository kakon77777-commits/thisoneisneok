// 程式研究區 pipeline: research/sources/*.md -> reading page + Markdown.
//
// Separate from the papers pipeline on purpose. Papers are finished work with a
// version and an evidence status; these are research drafts that feed MSSP's
// next versions, and they carry a direction instead — which of the four things
// MSSP is heading towards each one belongs to.
//
// Sources are Word documents converted with pandoc. The .docx used bold text
// where heading styles belong, so a 7,900-line document arrived with zero
// headings; research/sources/*.md is the converted and heading-promoted form,
// and is what publishes.
import fs from "node:fs";
import path from "node:path";
import { renderMarkdown, countLeftoverRawMath, countRenderedMath } from "./lib/markdown-math.mjs";

const root = process.cwd();
const sourceDir = path.join(root, "research", "sources");
const manifestPath = path.join(root, "research", "manifest.json");
const publicDir = path.join(root, "public");
const siteUrl = "https://thisoneisneok.com";

if (!fs.existsSync(manifestPath)) {
  console.log("No research/manifest.json — nothing to build.");
  process.exit(0);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const problems = [];
const fail = (slug, message) => problems.push(`${slug}: ${message}`);

const available = fs.existsSync(sourceDir)
  ? fs.readdirSync(sourceDir).filter((name) => name.endsWith(".md"))
  : [];
const claimed = new Set();

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

/** Section list from the H2s, so a long document is navigable. */
function tableOfContents(markdown) {
  return [...markdown.matchAll(/^##\s+(.+)$/gm)].map((m) => m[1].trim());
}

function slugifyHeading(text, index) {
  return `s${index}-${text.replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "").slice(0, 40).toLowerCase()}`;
}

function page(entry, bodyHtml, toc) {
  return `<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(entry.title.zh)} | 程式研究區 | Neo.K</title>
<meta name="description" content="${escapeHtml(entry.summary.zh)}">
<link rel="canonical" href="${entry.canonicalUrl}">
<link rel="stylesheet" href="/vendor/katex/katex.min.css">
<style>
:root{--paper:#f2efe8;--ink:#171914;--muted:#686b62;--line:#cbc8bf;--accent:#6551a6}
*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font-family:Inter,"Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif}
header,main,footer{width:min(900px,calc(100% - 40px));margin:auto}
header{padding:34px 0 18px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;gap:20px;font:12px ui-monospace,monospace;letter-spacing:.08em;flex-wrap:wrap}
main{padding:52px 0 96px}
.facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:14px;border:1px solid var(--line);padding:20px;margin:0 0 34px}
.facts div{display:flex;flex-direction:column;gap:5px}
.facts b{color:var(--accent);font:9px ui-monospace,monospace;letter-spacing:.1em;text-transform:uppercase}
.facts span{font-size:13px}
.provisional{border:1px solid var(--accent);color:var(--accent);padding:13px 17px;margin:0 0 30px;font-size:13px;line-height:1.7}
.toc{border:1px solid var(--line);padding:20px 24px;margin:0 0 44px}
.toc b{color:var(--accent);font:9px ui-monospace,monospace;letter-spacing:.11em;text-transform:uppercase}
.toc ol{margin:12px 0 0;padding-left:20px;columns:2;column-gap:32px}
.toc li{margin:.34em 0;font-size:13.5px;break-inside:avoid}
.toc a{color:var(--ink)}.toc a:hover{color:var(--accent);text-decoration:underline}
.content{font-size:17px;line-height:1.88;overflow-wrap:break-word}
.content h1{font-size:clamp(28px,4.6vw,44px);line-height:1.16;letter-spacing:-.04em;margin:4px 0 28px}
.content h2{font-size:25px;margin:58px 0 15px;padding-top:8px;border-top:1px solid var(--line)}
.content h3{font-size:19px;margin:36px 0 11px}
.content h4{font-size:16px;color:var(--muted);margin:26px 0 9px}
.content p{margin:0 0 22px}.content li{margin:.4em 0}
.content table{border-collapse:collapse;width:100%;font-size:14px;margin:0 0 26px;display:block;overflow-x:auto}
.content th,.content td{border:1px solid var(--line);padding:8px 11px;text-align:left;vertical-align:top}
.content code{font-family:ui-monospace,monospace;font-size:.86em;background:#e4e1d8;padding:.15em .35em;border-radius:4px}
.content pre{background:#e6e3da;padding:16px;overflow-x:auto;font-size:13px;line-height:1.6;border-left:3px solid var(--accent)}
.content pre code{background:none;padding:0}
.content blockquote{margin:30px 0;padding:4px 0 4px 24px;border-left:3px solid var(--accent);color:var(--muted)}
.content a{color:var(--accent)}
.content .katex-display{overflow-x:auto;overflow-y:hidden;padding:6px 0;margin:26px 0}
.source-download{margin:70px 0 0;border:1px solid var(--line);padding:24px}
.source-download b{color:var(--accent);font:9px ui-monospace,monospace;letter-spacing:.11em;text-transform:uppercase}
.source-download p{color:var(--muted);font-size:13px;line-height:1.7;margin:10px 0 16px}
.source-download a{display:inline-block;border:1px solid var(--line);color:var(--accent);font:11px ui-monospace,monospace;padding:9px 14px}
footer{border-top:1px solid var(--line);padding:24px 0 48px;display:flex;justify-content:space-between;gap:16px;font:12px ui-monospace,monospace;color:var(--muted);flex-wrap:wrap}
footer a{color:var(--accent)}
@media(max-width:700px){.content{font-size:16px}.toc ol{columns:1}header,footer{flex-direction:column}}
</style>
</head>
<body>
<header><strong>NEO.K / 程式研究區</strong><span>${escapeHtml(entry.direction.zh)}</span></header>
<main>
  <section class="facts">
    <div><b>方向</b><span>${escapeHtml(entry.direction.zh)}</span></div>
    <div><b>狀態</b><span>${escapeHtml(entry.status.zh)}</span></div>
    <div><b>日期</b><span>${escapeHtml(entry.date)}</span></div>
    <div><b>字數</b><span>${entry.charCount.toLocaleString()}</span></div>
  </section>
  ${entry.nameStatus === "provisional" ? `<p class="provisional"><strong>名稱暫定。</strong> ${escapeHtml(entry.nameNote?.zh ?? "")}</p>` : ""}
  ${toc.length ? `<nav class="toc"><b>目次</b><ol>${toc.map((t, i) => `<li><a href="#${slugifyHeading(t, i)}">${escapeHtml(t)}</a></li>`).join("")}</ol></nav>` : ""}
  <article class="content">${bodyHtml}</article>
  <section class="source-download">
    <b>原始檔</b>
    <p>這份研究的 Markdown 原始檔，與本頁由同一份來源產生。</p>
    <a href="${entry.mdUrl}">下載 Markdown ↓</a>
  </section>
</main>
<footer><span>Neo.K × EveMissLab · Apache-2.0</span><a href="${siteUrl}/research">回到程式研究區 ↗</a></footer>
</body>
</html>`;
}

const htmlDir = path.join(publicDir, "html", "research");
const mdDir = path.join(publicDir, "md", "research");
fs.mkdirSync(htmlDir, { recursive: true });
fs.mkdirSync(mdDir, { recursive: true });

const collected = [];
let mathRendered = 0;

for (const paper of manifest.papers) {
  const slug = paper.slug;
  if (!/^[a-z0-9-]+$/.test(slug)) fail(slug, "bad slug");
  for (const key of ["direction", "title", "summary", "date", "status"]) {
    if (!paper[key]) fail(slug, `manifest is missing ${key}`);
  }

  const sourcePath = path.join(sourceDir, `${slug}.md`);
  if (!fs.existsSync(sourcePath)) {
    fail(slug, `research/sources/${slug}.md does not exist`);
    continue;
  }
  claimed.add(`${slug}.md`);

  const markdown = fs.readFileSync(sourcePath, "utf8");

  // A converted document with no headings is a wall of text: it has no anchors,
  // no table of contents, and nothing to navigate by. That is a conversion
  // failure, not a stylistic preference, so it fails the build.
  const headings = (markdown.match(/^#{1,4}\s+/gm) || []).length;
  if (headings < 3) fail(slug, `only ${headings} heading(s) — the conversion lost the document's structure`);

  const toc = tableOfContents(markdown);
  let index = -1;
  const bodyHtml = renderMarkdown(markdown).replace(/<h2>/g, () => {
    index += 1;
    return `<h2 id="${slugifyHeading(toc[index] ?? String(index), index)}">`;
  });
  if (countLeftoverRawMath(bodyHtml)) fail(slug, "raw math delimiters survived rendering");
  mathRendered += countRenderedMath(bodyHtml);

  const entry = {
    slug,
    direction: paper.direction,
    title: paper.title,
    summary: paper.summary,
    status: paper.status,
    date: paper.date,
    nameStatus: paper.name_status ?? "settled",
    nameNote: paper.name_note ?? null,
    relatesTo: paper.relates_to ?? null,
    charCount: markdown.length,
    sectionCount: toc.length,
    href: `/html/research/${slug}.html`,
    canonicalUrl: `${siteUrl}/html/research/${slug}.html`,
    mdUrl: `${siteUrl}/md/research/${slug}.md`,
  };

  fs.writeFileSync(path.join(htmlDir, `${slug}.html`), page(entry, bodyHtml, toc));
  fs.copyFileSync(sourcePath, path.join(mdDir, `${slug}.md`));
  collected.push(entry);
}

// A converted source left out of the manifest would silently never publish.
for (const name of available) {
  if (!claimed.has(name)) fail(name, "source is in research/sources but not in the manifest");
}

if (problems.length) {
  console.error("Research manifest problems:");
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

fs.writeFileSync(
  path.join(root, "app", "data", "research.generated.ts"),
  `// Generated by scripts/build-research.mjs from research/manifest.json.\n` +
    `// Do not edit by hand — edit the manifest or the converted source.\n` +
    `export const researchPapers = ${JSON.stringify(collected, null, 2)};\n\n` +
    `export const researchCount = ${collected.length};\n` +
    `export const researchDirectionNote = ${JSON.stringify(manifest.direction_note, null, 2)};\n`,
);

fs.mkdirSync(path.join(publicDir, "ai"), { recursive: true });
fs.writeFileSync(
  path.join(publicDir, "ai", "research-index.json"),
  JSON.stringify(
    {
      site: siteUrl,
      count: collected.length,
      note: "程式研究區 — research feeding MSSP's next versions. Each entry publishes as a reading page and its Markdown source.",
      direction_note: manifest.direction_note,
      papers: collected.map(({ slug, direction, title, summary, status, date, nameStatus, canonicalUrl, mdUrl }) => ({
        slug, direction, title, summary, status, date, name_status: nameStatus, html: canonicalUrl, markdown: mdUrl,
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

console.log(`Built ${collected.length} research paper(s); ${mathRendered} formulas typeset.`);
for (const entry of collected) {
  console.log(`  ${entry.slug.padEnd(30)} ${entry.direction.zh.padEnd(8)} ${String(entry.charCount).padStart(7)} chars, ${entry.sectionCount} sections${entry.nameStatus === "provisional" ? "  [name provisional]" : ""}`);
}
