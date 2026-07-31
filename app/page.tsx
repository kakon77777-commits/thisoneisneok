"use client";

import Image from "next/image";
import Link from "next/link";
import { applications, books } from "./data/catalog";
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
        <div><strong>{books.length}</strong><span>{t({ zh: "書籍展示", en: "books on show" })}</span></div>
        <div><strong>ZH/EN</strong><span>{t({ zh: "自動語言切換", en: "automatic language" })}</span></div>
        <div><strong>MD</strong><span>{t({ zh: "人類閱讀＋AI 原始檔", en: "human pages + AI source" })}</span></div>
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
            <p className="eyebrow">BOOKS / EVOLVING EDITIONS</p>
            <h2>{t({ zh: "書並不完成；版本只是在時間中暫時停靠。", en: "Books do not finish; editions only pause in time." })}</h2>
          </div>
        </div>
        <div className="book-rail">
          {books.map((book) => (
            <article className="book-card" key={book.title.zh}>
              <div className="book-cover">
                <Image src={book.image} alt={t(book.title)} fill sizes="(max-width: 700px) 72vw, 260px" unoptimized />
              </div>
              <p>{t(book.phase)}</p>
              <h3>{t(book.title)}</h3>
              <span>{t(book.subtitle)}</span>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
