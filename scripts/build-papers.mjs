// Papers pipeline: ingest/01-before/<series>/*.md  ->  public HTML + PDF + MD.
//
// HTML and PDF are what a person reads; the Markdown is published underneath as
// a download. It was withheld at first on the reasoning that humans want the
// rendered page — true, but it sat badly next to the MSSP field lab, which
// publishes every example's full source on the grounds that a claim you cannot
// read the source of is not much of a claim. Same standard now applies to both.
//
// Metadata lives in two different shapes across the five series:
//   - Program_Universe_Foundations: YAML frontmatter
//   - PLDST / 時空域支配智能 / 計算機概念產品系列 / 表觀完好系統系列:
//     a "**標籤：** value" block under the H1
// Both are read here so no series has to be rewritten by hand.
import fs from "node:fs";
import path from "node:path";
import { marked, renderMarkdown, countRenderedMath, countMathErrors, countLeftoverRawMath } from "./lib/markdown-math.mjs";

const root = process.cwd();
const ingestDir = path.join(root, "ingest", "01-before");
const publicDir = path.join(root, "public");
const siteUrl = "https://thisoneisneok.com";

marked.use({ gfm: true, breaks: false });

const SERIES = [
  {
    dir: "Program_Universe_Foundations",
    code: "PU",
    title: { zh: "程式宇宙基礎", en: "Program Universe Foundations" },
    blurb: {
      zh: "對「程式語言到底是什麼」的現階段回答：從意圖、計算與物理三個存在域出發，重新定義程式、語言與可編譯的世界。",
      en: "A current answer to what a programming language actually is — rebuilt from three domains of existence: intention, computation, and physical reality.",
    },
  },
  {
    dir: "PLDST",
    code: "PLDST",
    title: { zh: "程式語言設計師風格譜系", en: "Programming Language Designer Style Taxonomy" },
    blurb: {
      zh: "歷代程式語言設計者的決策模式研究。不做人格診斷，而是把複雜度配置、責任分配、相容性與治理風格當作可比較的決策語料。",
      en: "A study of how successive language designers decide. Not personality diagnosis — complexity allocation, responsibility, compatibility, and governance treated as comparable decision data.",
    },
  },
  {
    dir: "計算機概念產品系列",
    code: "CCP",
    title: { zh: "計算機概念產品系列", en: "Computing Concept Products" },
    blurb: {
      zh: "運算架構的概念產品提案：光學、立體運算、拓撲約束、電源與熱管理。每篇都標明證據狀態，提出的效益是待驗證假說而非既成性能。",
      en: "Concept-product proposals for computing architecture: optics, stacked computation, topological constraints, power, and thermal control. Each states its evidence status; the claimed gains are hypotheses awaiting verification, not shipped performance.",
    },
  },
  {
    dir: "表觀完好系統系列",
    code: "OIS",
    title: { zh: "表觀完好系統", en: "Observably Sound Systems" },
    blurb: {
      zh: "從屎山、補償性完好到動態架構治理的十二篇。核心論點是功能正常不能推出結構正常：真正撐住系統的東西，往往分散在補償機制、操作慣例、相容層與人的知識裡，而不在架構圖上。最後兩篇把 MSSP 從靜態分類推成有宣告、觀察、有效三層角色的動態狀態系統。",
      en: "Twelve papers from the big ball of mud, through compensated integrity, to dynamic architecture governance. The core claim: working software does not imply sound structure — what actually holds a system up is often spread across compensations, operational routine, compatibility layers and human knowledge, none of which appear on the diagram. The last two turn MSSP from a static classification into a state system with declared, observed and effective roles.",
    },
  },
  {
    dir: "時空域支配智能",
    code: "STDI",
    title: { zh: "時空域支配智能", en: "Spatiotemporal Domain Intelligence" },
    blurb: {
      zh: "從單體具身智能延伸出的類未來 AI 概念產品：AI 如何在被明確授權、空間有限、時間持續的物理域中維持世界模型、權限與證據鏈。",
      en: "A near-future AI concept extended from single-agent embodiment: how an intelligence maintains a world model, permissions, and an evidence chain inside an explicitly authorised, bounded, persistent physical domain.",
    },
  },
];

const LABELS = {
  id: ["文件編號", "論文編號"],
  englishTitle: ["英文名稱"],
  // 計算機概念產品系列 carries both facts on one line
  // ("**公開修訂版**：v2.0，2026 年 7 月 29 日"), so the same labels feed both.
  version: ["版本", "公開修訂版"],
  date: ["日期", "公開修訂版", "原始版本"],
  seriesLine: ["系列", "系列定位"],
  status: ["文件狀態", "文件性質", "文件類型", "公開狀態", "定位"],
  evidence: ["證據狀態", "證據成熟度"],
  author: ["作者"],
  // Stated by 24 of the 89 papers and until now dropped on the floor. A paper
  // that names who worked on it with the author should keep saying so once
  // published; the label is the author's own, not an annotation added here.
  collaborator: ["協作整理"],
  license: ["論文授權"],
};

function stripBold(value) {
  return value.replace(/\*\*/g, "").trim();
}

/** YAML-ish frontmatter, only if the file opens with one. */
function readFrontmatter(source) {
  if (!source.startsWith("---\n")) return { meta: {}, body: source };
  const end = source.indexOf("\n---\n", 4);
  if (end === -1) return { meta: {}, body: source };
  const meta = {};
  for (const line of source.slice(4, end).split("\n")) {
    const split = line.indexOf(":");
    if (split === -1) continue;
    meta[line.slice(0, split).trim()] = line
      .slice(split + 1)
      .trim()
      .replace(/^['"]|['"]$/g, "");
  }
  return { meta, body: source.slice(end + 5) };
}

/** "**標籤：** value" / "**標籤**：value" lines in the header block. */
function readLabelBlock(body) {
  const found = {};
  for (const raw of body.split("\n").slice(0, 40)) {
    const line = raw.trim();
    const match = line.match(/^\*\*(.+?)\*\*\s*[：:]?\s*(.*)$/);
    if (!match) continue;
    const key = match[1].replace(/[：:]\s*$/, "").trim();
    const value = stripBold(match[2]).replace(/\s{2,}$/, "").trim();
    if (key && value) found[key] = value;
  }
  return found;
}

function pick(labels, keys) {
  for (const key of keys) if (labels[key]) return labels[key];
  return "";
}

/** First label value that actually yields a date, not just the first present. */
function pickDate(labels, keys) {
  for (const key of keys) {
    const parsed = normalizeDate(labels[key] || "");
    if (parsed) return parsed;
  }
  return "";
}

/** 2026 年 7 月 29 日 / 2026-07-30 -> 2026-07-30 */
function normalizeDate(value) {
  if (!value) return "";
  const iso = value.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return iso[0];
  const cjk = value.match(/(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日/);
  if (cjk) return `${cjk[1]}-${String(cjk[2]).padStart(2, "0")}-${String(cjk[3]).padStart(2, "0")}`;
  const ym = value.match(/(\d{4})\s*年\s*(\d{1,2})\s*月/);
  if (ym) return `${ym[1]}-${String(ym[2]).padStart(2, "0")}-01`;
  return "";
}

function normalizeVersion(value) {
  if (!value) return "";
  const match = value.match(/v?\d+(?:\.\d+)+/i);
  return match ? (match[0].startsWith("v") ? match[0] : `v${match[0]}`) : value.slice(0, 24);
}

/** 《...》系列第 12 篇  ->  12 */
function readOrder(text) {
  const match = text.match(/系列第\s*(\d+)\s*篇/);
  return match ? Number(match[1]) : null;
}

/** 表觀完好系統系列 numbers itself in a separate label: "**篇次：** 07 / 12". */
function readPartNumber(labels) {
  const match = (labels["篇次"] || "").match(/^\s*(\d+)/);
  return match ? Number(match[1]) : null;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function standaloneHtml(paper, seriesTitle, html) {
  const facts = [
    ["編號", paper.id],
    ["版本", paper.version],
    ["日期", paper.date],
    ["作者", paper.author],
    ["協作整理", paper.collaborator],
    ["狀態", paper.status],
    ["證據", paper.evidence],
  ].filter(([, value]) => value);
  return `<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(paper.title)} | Neo.K</title>
<meta name="description" content="${escapeHtml(paper.summary)}">
<link rel="canonical" href="${paper.canonicalUrl}">
<link rel="stylesheet" href="/vendor/katex/katex.min.css">
<style>
:root{--paper:#f2efe8;--ink:#171914;--muted:#686b62;--line:#cbc8bf;--accent:#315b53}
*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font-family:Inter,"Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif}
header,main,footer{width:min(880px,calc(100% - 40px));margin:auto}
header{padding:34px 0 18px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;gap:24px;font:12px/1.4 ui-monospace,monospace;letter-spacing:.08em;flex-wrap:wrap}
main{padding:56px 0 96px}
.facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px;border:1px solid var(--line);padding:20px;margin:0 0 46px}
.facts div{display:flex;flex-direction:column;gap:5px}
.facts dt,.facts b{color:var(--accent);font:9px ui-monospace,monospace;letter-spacing:.1em;text-transform:uppercase}
.facts span{font-size:13px;line-height:1.45}
.tools{display:flex;gap:18px;margin:0 0 44px;font:12px ui-monospace,monospace}
.tools a{color:var(--accent)}
.content{font-family:"Noto Serif TC","Songti TC",Georgia,serif;font-size:18px;line-height:1.95;letter-spacing:.015em;overflow-wrap:break-word}
.content h1{font-family:Inter,"Noto Sans TC",sans-serif;font-size:clamp(32px,5.4vw,54px);line-height:1.1;letter-spacing:-.04em;margin:10px 0 30px}
.content h2{font-family:Inter,"Noto Sans TC",sans-serif;font-size:26px;line-height:1.28;margin:58px 0 16px}
.content h3{font-family:Inter,"Noto Sans TC",sans-serif;font-size:19px;margin:38px 0 12px}
/* Demoting the body by one level pushes the deepest sections here, so they need
   to be styled rather than left to the browser's defaults. */
.content h4{font-family:Inter,"Noto Sans TC",sans-serif;font-size:16.5px;margin:30px 0 10px;color:var(--accent)}
.content h5,.content h6{font-family:Inter,"Noto Sans TC",sans-serif;font-size:14px;letter-spacing:.02em;margin:26px 0 9px;color:var(--muted)}
.content p{margin:0 0 24px}
.content blockquote{margin:36px 0;padding:4px 0 4px 26px;border-left:3px solid var(--accent);font-size:20px;line-height:1.7}
.content li{margin:.45em 0}
.content code{font-family:ui-monospace,monospace;font-size:.85em;background:#e2dfd6;padding:.15em .35em;border-radius:4px}
.content pre{background:#e2dfd6;padding:16px;overflow-x:auto;font-size:13px;line-height:1.6}
.content pre code{background:none;padding:0}
.content a{color:var(--accent)}
.content table{border-collapse:collapse;width:100%;font-size:14px;margin:0 0 28px;display:block;overflow-x:auto}
.content th,.content td{border:1px solid var(--line);padding:8px 11px;text-align:left;vertical-align:top}
.content hr{border:0;border-top:1px solid var(--line);margin:44px 0}
/* Long display formulas scroll inside their own block instead of forcing the
   page to scroll sideways; KaTeX itself never wraps a formula. */
.content .katex-display{overflow-x:auto;overflow-y:hidden;padding:6px 0;margin:28px 0}
.content .katex{font-size:1.04em}
.content .katex-error{color:#a3322b;font-family:ui-monospace,monospace;font-size:.85em}
.source-download{margin:72px 0 0;border:1px solid var(--line);padding:24px}
.source-download b{color:var(--accent);font:9px ui-monospace,monospace;letter-spacing:.11em;text-transform:uppercase}
.source-download p{color:var(--muted);font-size:13px;line-height:1.7;margin:10px 0 16px}
.source-download a{display:inline-block;border:1px solid var(--line-strong,rgba(23,25,20,.38));color:var(--accent);font:11px ui-monospace,monospace;padding:9px 14px}
footer{border-top:1px solid var(--line);padding:24px 0 48px;display:flex;justify-content:space-between;gap:20px;font:12px ui-monospace,monospace;color:var(--muted);flex-wrap:wrap}
footer a{color:var(--accent)}
@media(max-width:640px){main{padding-top:38px}.content{font-size:16px}header,footer{flex-direction:column}}
</style>
</head>
<body>
<header><strong>NEO.K / ${escapeHtml(paper.seriesCode)}</strong><span>${escapeHtml(seriesTitle)}</span></header>
<main>
  <section class="facts">${facts
    .map(([label, value]) => `<div><b>${escapeHtml(label)}</b><span>${escapeHtml(value)}</span></div>`)
    .join("")}</section>
  <p class="tools"><a href="${paper.pdfUrl}">下載 PDF ↓</a><a href="${siteUrl}/papers">回到論文索引 ↗</a></p>
  <article class="content">${html}</article>
  <section class="source-download">
    <b>原始檔</b>
    <p>這篇論文的 Markdown 原始檔，與上方頁面和 PDF 由同一份來源產生。</p>
    <a href="${paper.mdUrl}">下載 Markdown ↓</a>
  </section>
</main>
<footer><span>Neo.K × EveMissLab</span><a href="${paper.canonicalUrl}">${paper.canonicalUrl}</a></footer>
</body>
</html>`;
}

/** Push every heading down one level, leaving fenced code blocks alone.
 *
 * The page emits `<h1>{title}</h1>` itself and renders the body underneath, so
 * a paper that numbers its sections `# 1.` `# 2.` produces a second, third and
 * seventy-eighth H1 — every one of them styled as the page title, while the
 * `## 摘要` above them renders at half the size. The hierarchy comes out
 * inverted. 81 of the 89 papers are written this way, so the body is demoted
 * rather than the corpus rewritten.
 */
function demoteHeadings(markdown) {
  let inFence = false;
  return markdown
    .split("\n")
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) {
        inFence = !inFence;
        return line;
      }
      if (inFence) return line;
      // h6 is the floor; a heading already there stays where it is.
      return line.replace(/^(#{1,5})(\s)/, "#$1$2");
    })
    .join("\n");
}

/** First substantive paragraph after the header block, used as the card summary. */
function deriveSummary(body) {
  const lines = body.split("\n");
  let seenAbstract = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (/^##+\s*(摘要|Abstract)/i.test(line)) {
      seenAbstract = true;
      continue;
    }
    if (!seenAbstract) continue;
    if (!line || line.startsWith("#") || line.startsWith("---") || line.startsWith(">")) continue;
    if (/^\*\*.+\*\*\s*[：:]/.test(line)) continue;
    const text = stripBold(line).replace(/\[[^\]]*\]/g, "").trim();
    if (text.length > 40) return text.length > 210 ? `${text.slice(0, 208)}…` : text;
  }
  // No 摘要 heading — fall back to the first long paragraph anywhere.
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#") || line.startsWith("---") || line.startsWith("|")) continue;
    if (/^\*\*.+\*\*/.test(line)) continue;
    const text = stripBold(line).replace(/\[[^\]]*\]/g, "").trim();
    if (text.length > 40) return text.length > 210 ? `${text.slice(0, 208)}…` : text;
  }
  return "";
}

const collected = [];

for (const series of SERIES) {
  const dir = path.join(ingestDir, series.dir);
  if (!fs.existsSync(dir)) {
    console.warn(`[papers] missing series directory: ${series.dir}`);
    continue;
  }
  const filenames = fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .sort((a, b) => a.localeCompare(b, "zh-Hant"));

  const staged = filenames.map((filename) => {
    const source = fs.readFileSync(path.join(dir, filename), "utf8");
    const { meta, body } = readFrontmatter(source);
    const labels = readLabelBlock(body);

    const titleLine = body.split("\n").find((line) => line.startsWith("# "));
    const title = meta.title || (titleLine ? stripBold(titleLine.slice(2)) : filename.replace(/\.md$/, ""));

    const seriesLine = meta.series || pick(labels, LABELS.seriesLine) || "";
    const order = readPartNumber(labels) ?? readOrder(seriesLine) ?? readOrder(source) ?? null;

    // Prefer an ASCII document code the author already assigned; otherwise the
    // series code plus position, so every paper gets a stable, URL-safe id.
    const rawId = meta.paper_id || pick(labels, LABELS.id) || "";
    const asciiFromName = filename.match(/^([A-Za-z][A-Za-z0-9]*(?:[-_][A-Za-z0-9]+)*)_/);
    let id = "";
    if (/^[A-Za-z][A-Za-z0-9-]*$/.test(rawId) && /\d/.test(rawId)) id = rawId;
    else if (asciiFromName && /\d/.test(asciiFromName[1])) id = asciiFromName[1].replace(/_/g, "-");

    return { filename, source, body, meta, labels, title, seriesLine, order, id };
  });

  staged.sort((a, b) => {
    if (a.order !== null && b.order !== null && a.order !== b.order) return a.order - b.order;
    if (a.order !== null && b.order === null) return -1;
    if (a.order === null && b.order !== null) return 1;
    return a.filename.localeCompare(b.filename, "zh-Hant");
  });

  staged.forEach((entry, index) => {
    const id = entry.id || `${series.code}-${String(index + 1).padStart(2, "0")}`;
    const slug = id.toLowerCase();
    const paper = {
      id,
      slug,
      seriesCode: series.code,
      seriesDir: series.dir,
      title: entry.title,
      englishTitle: entry.meta.english_title || pick(entry.labels, LABELS.englishTitle) || "",
      // 時空域支配智能 states no 版本 label at all — its version lives in the
      // filename suffix (..._v0.1.md), so that is the last resort.
      version: normalizeVersion(
        entry.meta.version ||
          pick(entry.labels, LABELS.version) ||
          (entry.filename.match(/_v(\d+(?:\.\d+)+)(?:_|\.md$)/)?.[1] ?? ""),
      ),
      date: entry.meta.date
        ? normalizeDate(entry.meta.date)
        : pickDate(entry.labels, LABELS.date),
      author: entry.meta.author || pick(entry.labels, LABELS.author) || "Neo.K",
      collaborator: pick(entry.labels, LABELS.collaborator) || "",
      status: entry.meta.status || pick(entry.labels, LABELS.status) || "",
      evidence: pick(entry.labels, LABELS.evidence) || "",
      license: pick(entry.labels, LABELS.license) || "",
      summary: deriveSummary(entry.body),
      canonicalUrl: `${siteUrl}/html/papers/${slug}.html`,
      htmlUrl: `${siteUrl}/html/papers/${slug}.html`,
      pdfUrl: `${siteUrl}/pdf/papers/${slug}.pdf`,
      mdUrl: `${siteUrl}/md/papers/${slug}.md`,
      sourceFile: path.join("ingest", "01-before", series.dir, entry.filename),
      body: entry.body,
    };
    collected.push({ series, paper });
  });
}

// ---- write standalone HTML ----
// Generated output directories are cleared before writing.
// Without this a renamed or deleted entry keeps its old file published forever:
// the stale asset is served ahead of any redirect the Worker would issue, so the
// rename silently does not take effect.
const htmlDir = path.join(publicDir, "html", "papers");
const mdDir = path.join(publicDir, "md", "papers");
fs.rmSync(htmlDir, { recursive: true, force: true });
fs.rmSync(mdDir, { recursive: true, force: true });
fs.mkdirSync(htmlDir, { recursive: true });
fs.mkdirSync(mdDir, { recursive: true });
let mathRendered = 0;
let mathErrors = 0;
const mathErrorPapers = [];
let mathLeftover = 0;
const mathLeftoverPapers = [];
for (const { series, paper } of collected) {
  // Drop the leading H1 + label block from the body: the standalone page renders
  // its own title and facts panel, so leaving them in would print everything twice.
  const lines = paper.body.split("\n");
  const start = lines.findIndex((line) => line.startsWith("# "));
  const rest = start === -1 ? lines : lines.slice(start + 1);
  let cut = 0;
  for (let i = 0; i < rest.length && i < 40; i += 1) {
    const line = rest[i].trim();
    if (!line || line === "---" || /^\*\*.+\*\*/.test(line) || line.startsWith("## ") === false && /^[A-Za-z].*[:：]/.test(line)) {
      if (line.startsWith("## ")) break;
      cut = i + 1;
      continue;
    }
    break;
  }
  // Only demote where the body actually competes with the title. A paper whose
  // sections already start at `##` is left alone rather than pushed to `###`.
  const bodyMarkdown = rest.slice(cut).join("\n");
  const hasBodyH1 = bodyMarkdown.split("\n").some((line) => /^# \S/.test(line));
  const html = `<h1>${escapeHtml(paper.title)}</h1>\n${renderMarkdown(hasBodyH1 ? demoteHeadings(bodyMarkdown) : bodyMarkdown)}`;
  mathRendered += countRenderedMath(html);
  const errors = countMathErrors(html);
  if (errors) {
    mathErrors += errors;
    mathErrorPapers.push(`${paper.id} (${errors})`);
  }
  const leftover = countLeftoverRawMath(html);
  if (leftover) {
    mathLeftover += leftover;
    mathLeftoverPapers.push(`${paper.id} (${leftover})`);
  }
  fs.writeFileSync(path.join(htmlDir, `${paper.slug}.html`), standaloneHtml(paper, series.title.zh, html));
  // The source, byte for byte. Published under the slug rather than the original
  // filename so the three formats share one stem.
  fs.copyFileSync(path.join(root, paper.sourceFile), path.join(mdDir, `${paper.slug}.md`));
}

// ---- write the site's metadata module (no bodies: they stay out of the bundle) ----
const bySeries = SERIES.map((series) => ({
  code: series.code,
  title: series.title,
  blurb: series.blurb,
  papers: collected
    .filter((item) => item.series.code === series.code)
    // `body` is dropped (77 papers of prose would bloat the client bundle);
    // `sourceFile` is kept so the PDF renderer reads the exact same file this
    // pass read, instead of guessing it back from the title.
    .map(({ paper }) => {
      const { body, ...rest } = paper;
      void body;
      return rest;
    }),
}));

fs.mkdirSync(path.join(root, "app", "data"), { recursive: true });
fs.writeFileSync(
  path.join(root, "app", "data", "papers.generated.ts"),
  `// Generated by scripts/build-papers.mjs. Do not edit by hand.\n` +
    `// Sources live in ingest/01-before/ and are intentionally not published as Markdown.\n` +
    `export const paperSeries = ${JSON.stringify(bySeries, null, 2)};\n\n` +
    `export const paperCount = ${collected.length};\n`,
);

// ---- AI-readable index ----
fs.mkdirSync(path.join(publicDir, "ai"), { recursive: true });
fs.writeFileSync(
  path.join(publicDir, "ai", "papers-index.json"),
  JSON.stringify(
    {
      site: siteUrl,
      count: collected.length,
      note: "Papers publish as three formats from one source: a reading page, a PDF, and the Markdown original.",
      series: bySeries.map((series) => ({
        code: series.code,
        title: series.title.zh,
        englishTitle: series.title.en,
        papers: series.papers.map((paper) => ({
          id: paper.id,
          title: paper.title,
          englishTitle: paper.englishTitle,
          version: paper.version,
          date: paper.date,
          html: paper.htmlUrl,
          pdf: paper.pdfUrl,
          markdown: paper.mdUrl,
        })),
      })),
    },
    null,
    2,
  ),
);

// ---- merge paper URLs into the sitemap build-content.mjs just wrote ----
const sitemapPath = path.join(publicDir, "sitemap.xml");
if (fs.existsSync(sitemapPath)) {
  const existing = fs.readFileSync(sitemapPath, "utf8");
  const entries = collected
    .map(({ paper }) => `  <url><loc>${paper.htmlUrl}</loc></url>`)
    .join("\n");
  fs.writeFileSync(sitemapPath, existing.replace("</urlset>", `${entries}\n</urlset>`));
} else {
  console.warn("[papers] sitemap.xml not found — run build-content.mjs first to include papers in it.");
}

console.log(`Generated ${collected.length} papers across ${bySeries.length} series.`);
for (const series of bySeries) console.log(`  ${series.code.padEnd(6)} ${series.papers.length}`);
console.log(`Math: ${mathRendered} formulas rendered by KaTeX, ${mathErrors} rejected, ${mathLeftover} raw delimiters left.`);
if (mathErrorPapers.length) console.log(`  rejected in: ${mathErrorPapers.join(", ")}`);
if (mathLeftoverPapers.length) console.log(`  raw LaTeX still visible in: ${mathLeftoverPapers.join(", ")}`);

// A leftover `$$` means a reader sees raw LaTeX on the page — the exact failure
// this pipeline exists to prevent. The rendered count cannot catch it: it read
// 17,161 while two papers still shipped a visible \boxed{...} formula.
if (mathLeftover > 0) {
  console.error(`${mathLeftover} raw math delimiter(s) survived rendering. Refusing to publish raw LaTeX.`);
  process.exit(1);
}

// Every paper in this corpus contains display math. Zero rendered formulas means
// the KaTeX step silently stopped working (a delimiter regression, a missing
// dependency) and the papers would publish as raw LaTeX — which is precisely the
// state this pipeline exists to prevent, so fail rather than ship it.
if (mathRendered === 0) {
  console.error("No math was rendered at all — the KaTeX step is broken. Refusing to publish raw LaTeX.");
  process.exit(1);
}
