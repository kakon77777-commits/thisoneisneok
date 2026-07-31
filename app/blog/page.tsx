"use client";

import Link from "next/link";
import { PageIntro } from "../components/page-intro";
import { useLanguage } from "../components/language-context";
import { posts } from "../data/posts.generated";

export default function BlogPage() {
  const { language, t } = useLanguage();

  return (
    <main className="page-main blog-page">
      <PageIntro
        eyebrow={{ zh: "個人部落格／每日記錄", en: "Personal blog / daily records" }}
        title={{ zh: "在正式理論之外，保留每天真正想過的文字。", en: "Keeping the words actually thought each day, beyond formal theory." }}
        description={{
          zh: "每篇文章由 Markdown 生成閱讀網頁與 PDF，同時保留原始檔與固定網址。中文與英文共用同一篇文章身份。",
          en: "Each Markdown entry becomes a reading page and PDF while retaining its raw source and fixed URL. Chinese and English share one article identity.",
        }}
        aside={<a className="rss-card" href="https://thisoneisneok.com/feed.xml"><span>RSS</span><strong>{t({ zh: "訂閱更新", en: "Subscribe" })}</strong><small>https://thisoneisneok.com/feed.xml</small></a>}
      />

      <section className="blog-ledger">
        {posts.map((post, index) => {
          const localized = post.locales[language] || post.locales.zh || Object.values(post.locales)[0];
          return (
            <article key={post.slug}>
              <div className="blog-number">{String(index + 1).padStart(3, "0")}</div>
              <time dateTime={post.date}>{post.date}</time>
              <div className="blog-summary">
                <div className="tag-row">{post.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                <h2><Link href={`/blog/${post.slug}`}>{localized.title}</Link></h2>
                <p>{localized.description}</p>
                <code>{post.canonicalUrl}</code>
              </div>
              <Link href={`/blog/${post.slug}`} className="round-arrow" aria-label={t({ zh: "閱讀文章", en: "Read article" })}>↘</Link>
            </article>
          );
        })}
      </section>
    </main>
  );
}
