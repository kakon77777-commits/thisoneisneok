// MSSP collaboration ledger: mssp/discussions/*.md -> discussion pages,
// the MSSP page panel, raw Markdown and a machine-readable index.
//
// A discussion is deliberately not a governance decision. It may answer an
// implementation question or produce a candidate, but a method change still
// has to be promoted to the development log, development notes, an example,
// archaeology, or iteration authority by someone who holds that authority.
import fs from "node:fs";
import path from "node:path";
import { renderMarkdown, countLeftoverRawMath } from "./lib/markdown-math.mjs";

const root = process.cwd();
const discussionsDir = path.join(root, "mssp", "discussions");
const publicDir = path.join(root, "public");
const siteUrl = "https://thisoneisneok.com";
const statuses = new Set([
  "open",
  "needs-evidence",
  "discussing",
  "answered",
  "candidate",
  "parked",
  "closed",
]);
const requiredSections = [
  ["問題或提案", /^##\s+(?:問題或提案|Question or proposal)\s*$/m],
  ["證據與限制", /^##\s+(?:證據與限制|Evidence and limits)\s*$/m],
  ["討論紀錄", /^##\s+(?:討論紀錄|Discussion record)\s*$/m],
  ["目前結論", /^##\s+(?:目前結論|Current conclusion)\s*$/m],
  ["未決事項", /^##\s+(?:未決事項|Open questions)\s*$/m],
];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function parseDocument(source) {
  if (!source.startsWith("---\n")) return { meta: {}, body: source, frontmatter: false };
  const end = source.indexOf("\n---\n", 4);
  if (end === -1) return { meta: {}, body: source, frontmatter: false };
  const meta = {};
  for (const line of source.slice(4, end).split("\n")) {
    if (!line.trim() || line.trimStart().startsWith("#")) continue;
    const split = line.indexOf(":");
    if (split === -1) continue;
    meta[line.slice(0, split).trim()] = line.slice(split + 1).trim().replace(/^['"]|['"]$/g, "");
  }
  return { meta, body: source.slice(end + 5), frontmatter: true };
}

function csv(value) {
  return String(value || "").split(",").map((one) => one.trim()).filter(Boolean);
}

function validateThread(filename, source) {
  const issues = [];
  const { meta, body, frontmatter } = parseDocument(source);
  const slug = filename.replace(/\.md$/, "");
  if (!frontmatter) issues.push("missing frontmatter");
  for (const key of ["id", "title", "status", "opened", "updated", "opened_by", "managed_by", "summary"]) {
    if (!meta[key]) issues.push(`frontmatter is missing ${key}`);
  }
  if (meta.id && meta.id !== slug) issues.push(`id ${meta.id} does not match filename ${slug}`);
  if (meta.id && !/^mssp-d-\d{3}$/.test(meta.id)) issues.push("id must match mssp-d-NNN");
  if (meta.status && !statuses.has(meta.status)) issues.push(`unknown status ${meta.status}`);
  for (const key of ["opened", "updated"]) {
    if (meta[key] && !/^\d{4}-\d{2}-\d{2}$/.test(meta[key])) issues.push(`${key} must be an ISO date`);
  }
  if (meta.opened && meta.updated && meta.updated < meta.opened) issues.push("updated predates opened");
  if (meta.managed_by && meta.managed_by !== "Codex") issues.push("managed_by must remain Codex for this desk");
  if (meta.status === "closed" && !meta.decision_ref) issues.push("closed discussions require decision_ref");
  for (const [label, pattern] of requiredSections) {
    if (!pattern.test(body)) issues.push(`body is missing section ${label}`);
  }
  if (!/^###\s+\d{4}-\d{2}-\d{2}T[^\n]+—[^\n]+$/m.test(body)) {
    issues.push("discussion record needs at least one timestamped author entry");
  }
  return { issues, meta, body };
}

// Mutation check for the contract itself. A validator that has never been
// observed rejecting its central violation is not evidence. Keep this tiny and
// in-memory so the production tree stays untouched.
const contractFixture = `---
id: mssp-d-999
title: Contract fixture
status: open
opened: 2026-08-06
updated: 2026-08-06
opened_by: fixture
managed_by: Codex
summary: Validator fixture
---
# Contract fixture
## 問題或提案
x
## 證據與限制
x
## 討論紀錄
### 2026-08-06T00:00:00+08:00 — fixture / test
x
## 目前結論
x
## 未決事項
x
`;
if (validateThread("mssp-d-999.md", contractFixture).issues.length) {
  throw new Error("MSSP discussion contract rejected its valid fixture");
}
const mutated = contractFixture.replace("## 未決事項", "## 被移除的必要段落");
if (!validateThread("mssp-d-999.md", mutated).issues.some((issue) => issue.includes("未決事項"))) {
  throw new Error("MSSP discussion contract mutation check failed to reject a missing required section");
}

fs.mkdirSync(discussionsDir, { recursive: true });
const guidePath = path.join(discussionsDir, "README.md");
if (!fs.existsSync(guidePath)) throw new Error("mssp/discussions/README.md is required");
const guideSource = fs.readFileSync(guidePath, "utf8");
const threadFiles = fs.readdirSync(discussionsDir)
  .filter((name) => name.endsWith(".md") && name !== "README.md" && !name.startsWith("_"))
  .sort();
const problems = [];
const threads = [];

for (const filename of threadFiles) {
  const source = fs.readFileSync(path.join(discussionsDir, filename), "utf8");
  const { issues, meta, body } = validateThread(filename, source);
  for (const issue of issues) problems.push(`${filename}: ${issue}`);
  threads.push({
    id: meta.id,
    title: meta.title,
    status: meta.status,
    opened: meta.opened,
    updated: meta.updated,
    openedBy: meta.opened_by,
    managedBy: meta.managed_by,
    summary: meta.summary,
    relates: csv(meta.relates),
    tags: csv(meta.tags),
    decisionRef: meta.decision_ref || "",
    href: `/html/mssp/discussions/${meta.id}.html`,
    canonicalUrl: `${siteUrl}/html/mssp/discussions/${meta.id}.html`,
    sourceUrl: `${siteUrl}/md/mssp/discussions/${meta.id}.md`,
    body,
    source,
  });
}

if (problems.length) {
  console.error("MSSP discussion contract violations:");
  for (const problem of problems) console.error(`  - ${problem}`);
  console.error("\nRefusing to publish. Fix the discussion source, not the contract.");
  process.exit(1);
}

threads.sort((a, b) => b.updated.localeCompare(a.updated) || b.id.localeCompare(a.id));
const htmlDir = path.join(publicDir, "html", "mssp", "discussions");
const markdownDir = path.join(publicDir, "md", "mssp", "discussions");
fs.rmSync(htmlDir, { recursive: true, force: true });
fs.rmSync(markdownDir, { recursive: true, force: true });
fs.mkdirSync(htmlDir, { recursive: true });
fs.mkdirSync(markdownDir, { recursive: true });

function page({ title, description, status, updated, body, sourceUrl = "" }) {
  const rendered = renderMarkdown(body);
  if (countLeftoverRawMath(rendered)) throw new Error(`${title}: raw math delimiters survived rendering`);
  return `<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)} | MSSP Discussion | Neo.K</title>
<meta name="description" content="${escapeHtml(description)}">
<style>
:root{--paper:#f2efe8;--ink:#171914;--muted:#686b62;--line:#cbc8bf;--accent:#315b53;--bright:#d8ff65}
*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font-family:Inter,"Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif}
header,main,footer{width:min(880px,calc(100% - 40px));margin:auto}
header{padding:34px 0 18px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;gap:20px;font:12px ui-monospace,monospace;letter-spacing:.08em;flex-wrap:wrap}
main{padding:52px 0 96px}.state{display:inline-flex;gap:12px;align-items:center;border:1px solid var(--accent);color:var(--accent);font:9px ui-monospace,monospace;letter-spacing:.12em;padding:6px 10px;margin:0 0 30px;text-transform:uppercase}
.state i{width:7px;height:7px;border-radius:50%;background:var(--accent)}
.content{font-size:17px;line-height:1.88;overflow-wrap:break-word}.content h1{font-size:clamp(32px,5.4vw,54px);line-height:1.1;letter-spacing:-.04em;margin:4px 0 32px}.content h2{font-size:25px;line-height:1.3;margin:56px 0 15px;border-top:1px solid var(--line);padding-top:30px}.content h3{font-size:16px;line-height:1.5;margin:34px 0 11px;color:var(--accent)}.content p{margin:0 0 23px}.content li{margin:.42em 0}.content blockquote{margin:34px 0;padding:6px 0 6px 26px;border-left:3px solid var(--accent)}.content code{font-family:ui-monospace,monospace;font-size:.85em;background:#e2dfd6;padding:.15em .35em;border-radius:4px}.content pre{background:#e6e3da;padding:16px;overflow-x:auto;font-size:13px;line-height:1.62;border-left:3px solid var(--accent)}.content pre code{background:none;padding:0}.content a{color:var(--accent)}
footer{border-top:1px solid var(--line);padding:24px 0 48px;display:flex;justify-content:space-between;gap:16px;font:12px ui-monospace,monospace;color:var(--muted);flex-wrap:wrap}.footer-links{display:flex;gap:18px;flex-wrap:wrap}footer a{color:var(--accent)}
@media(max-width:640px){.content{font-size:16px}header,footer{flex-direction:column}}
</style>
</head>
<body>
<header><strong>NEO.K / MSSP DISCUSSION DESK</strong><span>${escapeHtml(updated)}</span></header>
<main><span class="state"><i></i>${escapeHtml(status)}</span><article class="content">${rendered}</article></main>
<footer><span>Managed by Codex · discussion is not a decision</span><span class="footer-links">${sourceUrl ? `<a href="${sourceUrl}">Markdown source ↗</a>` : ""}<a href="${siteUrl}/mssp#discussion">回到討論區 ↗</a></span></footer>
</body>
</html>`;
}

const guideUrl = `${siteUrl}/html/mssp/discussions/guide.html`;
fs.writeFileSync(
  path.join(htmlDir, "guide.html"),
  page({
    title: "MSSP 協作討論區寫作與治理規則",
    description: "另一個 AI、實作者與 Codex 在 MSSP 實作問題與改良候選上的可追查協作格式。",
    status: "PROTOCOL / IN FORCE",
    updated: "2026-08-06",
    body: guideSource,
    sourceUrl: `${siteUrl}/md/mssp/discussions/guide.md`,
  }),
);
fs.writeFileSync(path.join(markdownDir, "guide.md"), guideSource);

for (const thread of threads) {
  fs.writeFileSync(
    path.join(htmlDir, `${thread.id}.html`),
    page({
      title: thread.title,
      description: thread.summary,
      status: thread.status,
      updated: thread.updated,
      body: thread.body,
      sourceUrl: thread.sourceUrl,
    }),
  );
  fs.writeFileSync(path.join(markdownDir, `${thread.id}.md`), thread.source);
}

const publicThreads = threads.map(({ body, source, ...thread }) => {
  void body;
  void source;
  return thread;
});
const openStatuses = new Set(["open", "needs-evidence", "discussing", "candidate"]);
const openCount = publicThreads.filter((thread) => openStatuses.has(thread.status)).length;

fs.mkdirSync(path.join(root, "app", "data"), { recursive: true });
fs.writeFileSync(
  path.join(root, "app", "data", "mssp-discussions.generated.ts"),
  `// Generated by scripts/build-mssp-discussions.mjs. Do not edit by hand.\n` +
    `export type MsspDiscussion = {\n` +
    `  id: string; title: string; status: string; opened: string; updated: string;\n` +
    `  openedBy: string; managedBy: string; summary: string; relates: string[]; tags: string[];\n` +
    `  decisionRef: string; href: string; canonicalUrl: string; sourceUrl: string;\n` +
    `};\n\n` +
    `export const msspDiscussions: MsspDiscussion[] = ${JSON.stringify(publicThreads, null, 2)};\n\n` +
    `export const msspDiscussionCount = ${publicThreads.length};\n` +
    `export const msspDiscussionOpenCount = ${openCount};\n` +
    `export const msspDiscussionGuide = ${JSON.stringify({ href: "/html/mssp/discussions/guide.html", canonicalUrl: guideUrl })};\n`,
);

fs.mkdirSync(path.join(publicDir, "ai"), { recursive: true });
fs.writeFileSync(
  path.join(publicDir, "ai", "mssp-discussions-index.json"),
  `${JSON.stringify({
    site: siteUrl,
    purpose: "Evidence-aware implementation discussion for MSSP. Discussion does not itself authorize a method change.",
    manager: { name: "Codex", role: "MSSP collaborator and discussion manager" },
    protocol: guideUrl,
    sourceProtocol: `${siteUrl}/md/mssp/discussions/guide.md`,
    count: publicThreads.length,
    openCount,
    discussions: publicThreads,
  }, null, 2)}\n`,
);

const sitemapPath = path.join(publicDir, "sitemap.xml");
if (fs.existsSync(sitemapPath)) {
  const existing = fs.readFileSync(sitemapPath, "utf8");
  const withoutDiscussionUrls = existing.replace(
    /^\s*<url><loc>https:\/\/thisoneisneok\.com\/html\/mssp\/discussions\/[^<]+<\/loc><\/url>\r?\n?/gm,
    "",
  );
  const urls = [guideUrl, ...publicThreads.map((thread) => thread.canonicalUrl)];
  const entries = urls.map((url) => `  <url><loc>${url}</loc></url>`).join("\n");
  fs.writeFileSync(sitemapPath, withoutDiscussionUrls.replace("</urlset>", `${entries}\n</urlset>`));
}

console.log(`Built MSSP discussion desk: ${publicThreads.length} thread(s), ${openCount} active, manager=Codex.`);
