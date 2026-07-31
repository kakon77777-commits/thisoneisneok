"use client";

import { useMemo, useState } from "react";
import { PageIntro } from "../components/page-intro";
import { useLanguage } from "../components/language-context";
import { paperSeries, paperCount } from "../data/papers.generated";

export default function PapersPage() {
  const { language, t } = useLanguage();
  const [active, setActive] = useState<string>("all");
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return paperSeries
      .filter((series) => active === "all" || series.code === active)
      .map((series) => ({
        ...series,
        papers: series.papers.filter((paper) => {
          if (!q) return true;
          return [paper.id, paper.title, paper.englishTitle, paper.summary]
            .join(" ")
            .toLowerCase()
            .includes(q);
        }),
      }))
      .filter((series) => series.papers.length > 0);
  }, [active, query]);

  const shown = groups.reduce((total, series) => total + series.papers.length, 0);

  return (
    <main className="page-main papers-page">
      <PageIntro
        eyebrow={{ zh: "論文", en: "Papers" }}
        title={{
          zh: "四個系列，全部在計算機領域。",
          en: "Four series, all in computing.",
        }}
        description={{
          zh: "每篇論文以三種形式發表：閱讀網頁、PDF，以及頁面底部可下載的 Markdown 原始檔。三者出自同一份來源。版本、日期與證據狀態直接印在每篇論文上。",
          en: "Each paper publishes in three forms: a reading page, a PDF, and the Markdown source as a download at the foot of the page. All three come from one origin. Version, date, and evidence status are printed on every paper.",
        }}
        aside={<div className="metric-card"><strong>{paperCount}</strong><span>{t({ zh: "已發表論文", en: "papers published" })}</span></div>}
      />

      <section className="catalog-controls">
        <label className="search-box">
          <span aria-hidden="true">⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t({ zh: "搜尋編號、標題或摘要", en: "Search id, title, or abstract" })}
          />
        </label>
        <div className="filter-row">
          <button type="button" className={active === "all" ? "is-active" : ""} onClick={() => setActive("all")}>
            {t({ zh: "全部", en: "All" })}
          </button>
          {paperSeries.map((series) => (
            <button
              type="button"
              key={series.code}
              className={active === series.code ? "is-active" : ""}
              onClick={() => setActive(series.code)}
            >
              {series.code} · {series.papers.length}
            </button>
          ))}
        </div>
      </section>

      {query && shown === 0 ? (
        <p className="papers-nomatch">{t({ zh: "沒有符合的論文。", en: "No papers match." })}</p>
      ) : null}

      {groups.map((series) => (
        <section className="paper-series" key={series.code} id={series.code}>
          <header>
            <p className="eyebrow">{series.code} / {series.papers.length}</p>
            <h2>{language === "zh" ? series.title.zh : series.title.en}</h2>
            <p>{language === "zh" ? series.blurb.zh : series.blurb.en}</p>
          </header>
          <ol className="paper-list">
            {series.papers.map((paper) => (
              <li key={paper.id}>
                <span className="paper-id">{paper.id}</span>
                <div className="paper-body">
                  <h3><a href={paper.htmlUrl}>{paper.title}</a></h3>
                  {paper.englishTitle ? <p className="paper-en">{paper.englishTitle}</p> : null}
                  {paper.summary ? <p className="paper-summary">{paper.summary}</p> : null}
                  <p className="paper-meta">
                    {[paper.version, paper.date, paper.evidence || paper.status].filter(Boolean).join("  ·  ")}
                  </p>
                </div>
                <div className="paper-formats">
                  <a href={paper.htmlUrl}>HTML ↗</a>
                  <a href={paper.pdfUrl}>PDF ↓</a>
                  <a href={paper.mdUrl}>MD ↓</a>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}

      <section className="source-banner">
        <div><span>AI / INDEX</span><h2>{t({ zh: "機器可讀的論文索引。", en: "A machine-readable paper index." })}</h2></div>
        <p>{t({
          zh: "每篇論文的編號、版本、日期與三種格式網址都收在同一份 JSON。",
          en: "Every paper's id, version, date, and all three format URLs live in one JSON file.",
        })}</p>
        <a href="https://thisoneisneok.com/ai/papers-index.json">{t({ zh: "開啟論文索引", en: "Open the paper index" })} ↗</a>
      </section>
    </main>
  );
}
