"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { applications, phaseLabels } from "../../data/catalog";
import { useLanguage } from "../../components/language-context";

export default function AppDetailPage() {
  const params = useParams<{ slug: string }>();
  const item = applications.find((entry) => entry.slug === params.slug);
  const { language, t } = useLanguage();

  if (!item) {
    return <main className="page-main empty-state"><h1>404</h1><Link href="/apps">Back to catalog</Link></main>;
  }

  return (
    <main className="page-main project-detail">
      <Link href="/apps" className="back-link">← {t({ zh: "返回應用目錄", en: "Back to applications" })}</Link>
      <section className={`detail-hero accent-${item.accent}`}>
        <div>
          <div className="project-meta">
            <span className="phase-pill">{t(phaseLabels[item.phase])}</span>
            <span>{item.version}</span>
            <span>{item.updated}</span>
          </div>
          <h1>{t(item.title)}</h1>
          <p>{t(item.summary)}</p>
          <div className="tag-row">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        </div>
        <div className="detail-glyph" aria-hidden="true"><b>{item.title.en.slice(0, 2).toUpperCase()}</b><i /></div>
      </section>

      <section className="detail-grid">
        <article>
          <p className="eyebrow">CURRENT POSITION</p>
          <h2>{t({ zh: "目前位置", en: "Current position" })}</h2>
          <p>{t({
            zh: "這個項目被視為持續演化的實驗單元。詳細說明、版本紀錄、展示與原始碼會在實作推進時逐步補入同一個固定網址。",
            en: "This project is treated as an evolving experimental unit. Documentation, versions, demos, and source will accumulate at this fixed URL as implementation advances.",
          })}</p>
        </article>
        <aside className="absolute-url-card">
          <span>{t({ zh: "永久網址", en: "Absolute URL" })}</span>
          <code>{item.canonicalUrl}</code>
          <div>
            {item.externalUrl ? <a href={item.externalUrl} target="_blank" rel="noreferrer">{t({ zh: "開啟實際項目", en: "Open live project" })} ↗</a> : null}
            {item.sourceUrl ? <a href={item.sourceUrl}>{t({ zh: "查看原始碼", en: "View source" })} ↗</a> : null}
          </div>
        </aside>
      </section>

      <section className="detail-note">
        <span>NOTE / {language.toUpperCase()}</span>
        <p>{t({
          zh: "此頁的狀態、描述與版本不是成熟度宣言，而是目前可被外部辨識的工作截面。",
          en: "The status, description, and version on this page are not declarations of maturity; they are the current externally legible work surface.",
        })}</p>
      </section>
    </main>
  );
}
