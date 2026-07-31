"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { posts } from "../../data/posts.generated";
import { useLanguage } from "../../components/language-context";

export default function BlogPostPage() {
  const params = useParams<{ slug: string }>();
  const post = posts.find((entry) => entry.slug === params.slug);
  const { language, t } = useLanguage();

  if (!post) {
    return <main className="page-main empty-state"><h1>404</h1><Link href="/blog">Back to blog</Link></main>;
  }

  const localized = post.locales[language] || post.locales.zh || Object.values(post.locales)[0];

  return (
    <main className="article-page">
      <header className="article-header">
        <Link href="/blog" className="back-link">← {t({ zh: "返回部落格", en: "Back to blog" })}</Link>
        <div className="article-meta">
          <span>PERSONAL LOG / {language.toUpperCase()}</span>
          <time dateTime={post.date}>{post.date}</time>
        </div>
        <h1>{localized.title}</h1>
        <p>{localized.description}</p>
        <div className="tag-row">{post.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
      </header>

      <div className="article-layout">
        <article className="article-prose" dangerouslySetInnerHTML={{ __html: localized.html }} />
        <aside className="article-tools">
          <div>
            <span>{t({ zh: "永久網址", en: "Absolute URL" })}</span>
            <code>{post.canonicalUrl}</code>
          </div>
          <a href={localized.standaloneHtmlUrl}>{t({ zh: "獨立 HTML", en: "Standalone HTML" })}<span>↗</span></a>
          <a href={localized.pdfUrl}>{t({ zh: "下載 PDF", en: "Download PDF" })}<span>↓</span></a>
          <a href={localized.sourceUrl}>{t({ zh: "原始 Markdown", en: "Raw Markdown" })}<span>↗</span></a>
          <a href="https://thisoneisneok.com/ai/site-index.md">{t({ zh: "AI 內容索引", en: "AI content index" })}<span>↗</span></a>
        </aside>
      </div>

      <footer className="article-footer">
        <span>Neo.K × EveMissLab</span>
        <Link href="/blog">{t({ zh: "繼續閱讀其他記錄", en: "Continue with other entries" })} →</Link>
      </footer>
    </main>
  );
}
