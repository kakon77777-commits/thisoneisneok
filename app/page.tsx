"use client";

import Image from "next/image";
import Link from "next/link";
import { applications } from "./data/catalog";
import { books, bookCount, bookEditionCount } from "./data/books.generated";
import { paperSeries, paperCount } from "./data/papers.generated";
import { posts } from "./data/posts.generated";
import { ProjectCard } from "./components/project-card";
import { PendingPanel } from "./components/pending-panel";
import { useLanguage } from "./components/language-context";

export default function Home() {
  const { language, t } = useLanguage();
  const latestPost = posts[0];

  return (
    <main>
      <section className="home-hero">
        <div className="hero-copy">
          <p className="eyebrow">NEO.K / EVEMISSLAB / 2026</p>
          <h1>
            {language === "zh" ? (
              <>在理論與程式之間，<em>持續建造。</em></>
            ) : (
              <>Building continuously <em>between theory and code.</em></>
            )}
          </h1>
          <p className="hero-lede">
            {t({
              zh: "這裡不是完整論文庫，而是一個仍在生活的個人網站：記錄文字、展示研究應用，並把 MSSP 從方法推進到可使用的結構。",
              en: "This is not a complete paper repository. It is a living personal site for writing, research applications, and moving MSSP from method to usable structure.",
            })}
          </p>
          <div className="hero-actions">
            <Link href="/mssp" className="primary-button">
              {t({ zh: "進入 MSSP 專區", en: "Enter the MSSP field lab" })}
            </Link>
            <Link href="/blog" className="text-link">
              {t({ zh: "閱讀個人記錄", en: "Read personal notes" })} <span>↗</span>
            </Link>
          </div>
        </div>

        <div className="hero-instrument" aria-label={t({ zh: "網站結構圖", en: "Site structure diagram" })}>
          <div className="instrument-head">
            <span>FIELD / 01</span>
            <span className="live-dot">LIVE</span>
          </div>
          <div className="orbit orbit-a"><span>MSSP</span></div>
          <div className="orbit orbit-b"><span>APPS</span></div>
          <div className="orbit orbit-c"><span>BLOG</span></div>
          <div className="instrument-center"><b>N·K</b><small>EVE / LAB</small></div>
          <div className="instrument-foot">
            <span>ZH / EN</span>
            <span>ABSOLUTE URL</span>
          </div>
        </div>
      </section>

      {/* The first cell leads with MSSP while the application catalog is empty.
          Swap it back to a live count once applications.length is non-zero. */}
      <section className="home-strip" aria-label={t({ zh: "網站範圍", en: "Site scope" })}>
        <div><strong>MSSP</strong><span>{t({ zh: "主要專區", en: "primary field" })}</span></div>
        <div><strong>{paperCount}</strong><span>{t({ zh: "論文（4 系列）", en: "papers, 4 series" })}</span></div>
        <div><strong>ZH/EN</strong><span>{t({ zh: "自動語言切換", en: "automatic language" })}</span></div>
        <div><strong>HTML<br />PDF</strong><span>{t({ zh: "兩種發表格式", en: "two published formats" })}</span></div>
      </section>

      <section className="section-block papers-feature">
        <div className="section-heading">
          <div>
            <p className="eyebrow">PAPERS / {paperCount}</p>
            <h2>{t({ zh: "四個系列，全部在計算機領域。", en: "Four series, all in computing." })}</h2>
          </div>
          <Link href="/papers" className="text-link">{t({ zh: "進入論文區", en: "Enter papers" })} ↗</Link>
        </div>
        <div className="series-rail">
          {paperSeries.map((series) => (
            <Link href={`/papers#${series.code}`} className="series-card" key={series.code}>
              <span>{series.code}</span>
              <strong>{language === "zh" ? series.title.zh : series.title.en}</strong>
              <p>{language === "zh" ? series.blurb.zh : series.blurb.en}</p>
              <b>{series.papers.length}</b>
            </Link>
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">SELECTED APPLICATIONS</p>
            <h2>{t({ zh: "應用不是結論，而是研究留下的可操作痕跡。", en: "Applications are operable traces left by research." })}</h2>
          </div>
          {applications.length ? (
            <Link href="/apps" className="text-link">{t({ zh: "查看全部", en: "View all" })} ↗</Link>
          ) : null}
        </div>
        {applications.length ? (
          <div className="project-grid featured-grid">
            {applications.slice(0, 4).map((item, index) => (
              <ProjectCard item={item} index={index} key={item.slug} />
            ))}
          </div>
        ) : (
          <PendingPanel
            code="EMPTY / 00"
            title={{
              zh: "這一區目前是空的，而且是刻意的。",
              en: "This section is empty, and that is deliberate.",
            }}
            note={{
              zh: "舊的示範卡片已經全部移除。實驗性小應用要能真的被打開、被操作，才會進駐這裡——不放佔位卡片。",
              en: "The old demonstration cards have been removed. An experimental application appears here only once it can actually be opened and operated — no placeholder cards.",
            }}
            action={{ href: "/mssp", label: { zh: "先看 MSSP 專區", en: "Start with the MSSP field lab" } }}
          />
        )}
      </section>

      <section className="mssp-feature">
        <div className="mssp-monogram" aria-hidden="true">
          <span>M</span><span>S</span><span>S</span><span>P</span>
        </div>
        <div>
          <p className="eyebrow">MAIN FIELD / MSSP</p>
          <h2>{t({ zh: "把專案拆成可觀察、可替換、可重組的狀態結構。", en: "Turn projects into observable, replaceable, and recomposable state structures." })}</h2>
          <p>{t({
            zh: "MSSP 專區將持續收錄方法說明、開源專案考古、重構紀錄、參考實作與實際教學。它不是另一組普通卡片，而是這個網站真正長期擴張的主軸。",
            en: "The MSSP field lab continuously gathers methods, open-source archaeology, reconstruction logs, reference implementations, and practical tutorials. It is the site's primary long-term axis.",
          })}</p>
          <Link href="/mssp" className="primary-button">{t({ zh: "開始理解 MSSP", en: "Start with MSSP" })}</Link>
        </div>
      </section>

      {latestPost ? (
        <section className="latest-writing">
          <div className="writing-index"><span>LOG</span><b>001</b></div>
          <div>
            <p className="eyebrow">LATEST PERSONAL NOTE</p>
            <h2>{latestPost.locales[language]?.title || latestPost.locales.zh.title}</h2>
            <p>{latestPost.locales[language]?.description || latestPost.locales.zh.description}</p>
            <Link href={`/blog/${latestPost.slug}`} className="text-link">
              {t({ zh: "閱讀文章", en: "Read the entry" })} ↗
            </Link>
          </div>
          <time dateTime={latestPost.date}>{latestPost.date}</time>
        </section>
      ) : null}

      <section className="section-block books-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">BOOKS / {bookCount} · {bookEditionCount} EDITIONS</p>
            <h2>{t({ zh: "已經在架上的書。", en: "Books already on the shelf." })}</h2>
          </div>
        </div>
        <p className="books-note">{t({
          zh: `${bookCount} 部作品、${bookEditionCount} 個版本，全部在 Amazon 上。有中文版的連中文版，只有英文版的連英文版。`,
          en: `${bookCount} works across ${bookEditionCount} editions, all on Amazon. Each cover links to the Traditional Chinese edition where one exists, and to the English edition otherwise.`,
        })}</p>
        <div className="book-rail">
          {books.map((book) => (
            <article className="book-card" key={book.slug}>
              <a href={book.url} target="_blank" rel="noreferrer" className="book-cover">
                <Image
                  src={book.image}
                  alt={language === "zh" ? book.title.zh : book.title.en}
                  fill
                  sizes="(max-width: 700px) 72vw, 260px"
                  unoptimized
                />
              </a>
              <p>
                {book.series ? `${book.series} #${book.seriesIndex}` : book.bilingual
                  ? t({ zh: "中文版／英文版", en: "Chinese & English" })
                  : book.primaryLang === "zh"
                    ? t({ zh: "繁體中文版", en: "Traditional Chinese" })
                    : t({ zh: "英文版", en: "English" })}
              </p>
              <h3>
                <a href={book.url} target="_blank" rel="noreferrer">
                  {language === "zh" ? book.title.zh : book.title.en}
                </a>
              </h3>
              <span>{language === "zh" ? book.subtitle.zh : book.subtitle.en}</span>
              {book.editions.length > 1 ? (
                <div className="book-editions">
                  {book.editions.map((edition) => (
                    <a href={edition.url} target="_blank" rel="noreferrer" key={edition.asin}>
                      {edition.lang === "zh" ? "中文" : "EN"} ↗
                    </a>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
