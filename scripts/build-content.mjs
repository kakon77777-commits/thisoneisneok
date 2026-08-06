import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";

const root = process.cwd();
const contentDir = path.join(root, "content", "blog");
const publicDir = path.join(root, "public");
const siteUrl = "https://thisoneisneok.com";

marked.use({ gfm: true, breaks: false });

function ensure(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function parseFrontmatter(source) {
  if (!source.startsWith("---\n")) throw new Error("Missing frontmatter");
  const end = source.indexOf("\n---\n", 4);
  if (end === -1) throw new Error("Unclosed frontmatter");
  const meta = {};
  for (const line of source.slice(4, end).split("\n")) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    value = value.replace(/^['"]|['"]$/g, "");
    meta[key] = value;
  }
  return { meta, body: source.slice(end + 5).trim() };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function standaloneHtml(post, locale) {
  const lang = locale === "zh" ? "zh-Hant" : "en";
  const label = locale === "zh" ? "原始 Markdown" : "Raw Markdown";
  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(post.title)} | Neo.K</title>
  <meta name="description" content="${escapeHtml(post.description)}">
  <link rel="canonical" href="${post.canonical}">
  <style>
    :root{--paper:#f2efe8;--ink:#171914;--muted:#686b62;--line:#cbc8bf;--accent:#315b53}
    *{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font-family:Inter,"Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif}
    header,main,footer{width:min(880px,calc(100% - 40px));margin:auto}header{padding:34px 0 18px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;gap:24px;font:12px/1.4 ui-monospace,monospace;letter-spacing:.08em}
    main{padding:72px 0 96px}.meta{color:var(--accent);font:700 12px ui-monospace,monospace;letter-spacing:.12em}.content{font-family:"Noto Serif TC","Songti TC",Georgia,serif;font-size:19px;line-height:1.95;letter-spacing:.015em}.content h1{font-family:Inter,"Noto Sans TC",sans-serif;font-size:clamp(40px,7vw,74px);line-height:1.05;letter-spacing:-.045em;margin:18px 0 40px;max-width:820px}.content h2{font-family:Inter,"Noto Sans TC",sans-serif;font-size:28px;line-height:1.25;margin:64px 0 18px}.content p{margin:0 0 26px}.content blockquote{margin:42px 0;padding:4px 0 4px 28px;border-left:3px solid var(--accent);font-size:24px;line-height:1.6}.content li{margin:.5em 0}.content code{font-family:ui-monospace,monospace;font-size:.85em;background:#e2dfd6;padding:.15em .35em;border-radius:4px}.content a{color:var(--accent)}
    footer{border-top:1px solid var(--line);padding:24px 0 48px;display:flex;justify-content:space-between;gap:20px;font:12px ui-monospace,monospace;color:var(--muted)}footer a{color:var(--accent)}
    @media(max-width:640px){main{padding-top:48px}.content{font-size:17px}.content h1{font-size:42px}header,footer{flex-direction:column}}
  </style>
</head>
<body>
  <header><strong>NEO.K / PERSONAL LOG</strong><span>${post.date} · ${escapeHtml(post.tags.join(" / "))}</span></header>
  <main><p class="meta">ABSOLUTE URL · ${post.canonical}</p><article class="content">${post.html}</article></main>
  <footer><span>Neo.K × EveMissLab</span><a href="${post.sourceUrl}">${label} ↗</a></footer>
</body>
</html>`;
}

const records = new Map();
for (const filename of fs.readdirSync(contentDir).filter((name) => name.endsWith(".md"))) {
  const source = fs.readFileSync(path.join(contentDir, filename), "utf8");
  const { meta, body } = parseFrontmatter(source);
  const required = ["slug", "locale", "date", "title", "description", "canonical"];
  for (const key of required) if (!meta[key]) throw new Error(`${filename}: missing ${key}`);
  const locale = meta.locale;
  const sourceUrl = `${siteUrl}/md/blog/${meta.slug}.${locale}.md`;
  const standaloneHtmlUrl = `${siteUrl}/html/blog/${meta.slug}.${locale}.html`;
  const pdfUrl = `${siteUrl}/pdf/blog/${meta.slug}.${locale}.pdf`;
  const entry = records.get(meta.slug) || {
    slug: meta.slug,
    date: meta.date,
    tags: meta.tags ? meta.tags.split(",").map((tag) => tag.trim()) : [],
    canonicalUrl: meta.canonical,
    locales: {},
  };
  entry.locales[locale] = {
    title: meta.title,
    description: meta.description,
    html: marked.parse(body),
    sourceUrl,
    standaloneHtmlUrl,
    pdfUrl,
  };
  records.set(meta.slug, entry);

  ensure(path.join(publicDir, "md", "blog"));
  fs.copyFileSync(path.join(contentDir, filename), path.join(publicDir, "md", "blog", `${meta.slug}.${locale}.md`));
}

const posts = [...records.values()].sort((a, b) => b.date.localeCompare(a.date));

ensure(path.join(root, "app", "data"));
fs.writeFileSync(
  path.join(root, "app", "data", "posts.generated.ts"),
  `// Generated by scripts/build-content.mjs. Do not edit by hand.\nexport const posts = ${JSON.stringify(posts, null, 2)} as const;\n`,
);

ensure(path.join(publicDir, "html", "blog"));
for (const post of posts) {
  for (const [locale, localized] of Object.entries(post.locales)) {
    fs.writeFileSync(
      path.join(publicDir, "html", "blog", `${post.slug}.${locale}.html`),
      standaloneHtml({ ...localized, date: post.date, tags: post.tags, canonical: post.canonicalUrl }, locale),
    );
  }
}

const routes = ["/", "/papers", "/apps", "/mssp", "/lean4", "/blog", "/about", "/source/site-source-guide.md"];
const sitemapEntries = [...routes, ...posts.map((post) => `/blog/${post.slug}`)]
  .map((route) => `  <url><loc>${siteUrl}${route}</loc></url>`)
  .join("\n");
fs.writeFileSync(path.join(publicDir, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries}\n</urlset>\n`);

const rssItems = posts.map((post) => {
  const zh = post.locales.zh || Object.values(post.locales)[0];
  return `<item><title><![CDATA[${zh.title}]]></title><link>${post.canonicalUrl}</link><guid>${post.canonicalUrl}</guid><pubDate>${new Date(`${post.date}T00:00:00+08:00`).toUTCString()}</pubDate><description><![CDATA[${zh.description}]]></description></item>`;
}).join("\n");
fs.writeFileSync(path.join(publicDir, "feed.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>Neo.K Personal Log</title><link>${siteUrl}/blog</link><description>Personal notes, applications, and MSSP field records.</description>${rssItems}</channel></rss>\n`);

ensure(path.join(publicDir, "ai"));
const aiIndex = `# Neo.K × EveMissLab AI Index\n\nCanonical site: ${siteUrl}/\n\n## Sections\n\n${routes.map((route) => `- ${siteUrl}${route}`).join("\n")}\n\n## Blog entries\n\n${posts.map((post) => `- ${post.canonicalUrl}\n  - ZH Markdown: ${post.locales.zh?.sourceUrl || "not available"}\n  - EN Markdown: ${post.locales.en?.sourceUrl || "not available"}`).join("\n")}\n\n## Wider network\n\n- https://evemiss.com/ — main navigation site, reaching most of the network\n- https://evemisslab.com/ — research and application brand entrance\n`;
const aiIndexWithCollaboration = aiIndex.replace(
  "\n\n## Blog entries",
  `\n\n## MSSP collaboration\n\n- ${siteUrl}/html/mssp/discussions/guide.html\n- ${siteUrl}/ai/mssp-discussions-index.json\n\nDiscussion is evidence-aware working state and does not itself authorise a method change.\n\n## Blog entries`,
);
fs.writeFileSync(path.join(publicDir, "ai", "site-index.md"), aiIndexWithCollaboration);
fs.writeFileSync(path.join(publicDir, "ai", "blog-index.json"), JSON.stringify(posts.map(({ slug, date, tags, canonicalUrl, locales }) => ({ slug, date, tags, canonicalUrl, locales: Object.fromEntries(Object.entries(locales).map(([locale, value]) => [locale, { title: value.title, description: value.description, sourceUrl: value.sourceUrl }])) })), null, 2));

console.log(`Generated ${posts.length} bilingual blog entries.`);
