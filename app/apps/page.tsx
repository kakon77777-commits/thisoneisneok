"use client";

import { useMemo, useState } from "react";
import { applications } from "../data/catalog";
import { experiments, experimentCount, experimentSourceFileCount } from "../data/apps.generated";
import { ProjectCard } from "../components/project-card";
import { PageIntro } from "../components/page-intro";
import { PendingPanel } from "../components/pending-panel";
import { useLanguage } from "../components/language-context";

const ALL_TAGS = [...new Set(experiments.flatMap((item) => item.tags))].sort();

export default function AppsPage() {
  const [tag, setTag] = useState<string>("all");
  const [query, setQuery] = useState("");
  const { language, t } = useLanguage();

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return experiments.filter((item) => {
      const tagMatch = tag === "all" || item.tags.includes(tag);
      if (!q) return tagMatch;
      const haystack = [item.title.zh, item.title.en, item.summary.zh, item.summary.en, item.slug, ...item.tags]
        .join(" ")
        .toLowerCase();
      return tagMatch && haystack.includes(q);
    });
  }, [tag, query]);

  return (
    <main className="page-main">
      <PageIntro
        eyebrow={{ zh: "應用與實驗", en: "Applications & experiments" }}
        title={{ zh: "把研究暫時編譯成可被打開的東西。", en: "Temporarily compiling research into things that can be opened." }}
        description={{
          zh: "全部在瀏覽器裡直接跑，不需要安裝，也不上傳任何東西。多數是同一個問題的連續迭代，這裡只放最新的一版，並標出這條線走過幾版。",
          en: "Everything runs in the browser: nothing to install, nothing uploaded. Most are successive iterations on one question, so only the latest is published — with a count of how many versions that line went through.",
        }}
        aside={
          <div className="metric-card">
            <strong>{experimentCount}</strong>
            <span>{t({ zh: `實驗，來自 ${experimentSourceFileCount} 個檔案`, en: `experiments from ${experimentSourceFileCount} files` })}</span>
          </div>
        }
      />

      {applications.length ? (
        <section className="project-grid catalog-grid">
          {applications.map((item, index) => <ProjectCard item={item} index={index} key={item.slug} />)}
        </section>
      ) : null}

      <section className="catalog-controls">
        <label className="search-box">
          <span aria-hidden="true">⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t({ zh: "搜尋名稱、說明或標籤", en: "Search names, descriptions, or tags" })}
          />
        </label>
        <div className="filter-row">
          <button type="button" className={tag === "all" ? "is-active" : ""} onClick={() => setTag("all")}>
            {t({ zh: "全部", en: "All" })} · {experiments.length}
          </button>
          {ALL_TAGS.map((item) => (
            <button type="button" key={item} className={tag === item ? "is-active" : ""} onClick={() => setTag(item)}>
              {item}
            </button>
          ))}
        </div>
      </section>

      {visible.length ? (
        <section className="experiment-grid">
          {visible.map((item) => (
            <article className="experiment-card" key={item.slug}>
              <header>
                <span className="experiment-version">{item.version}</span>
                {item.versionCount > 1 ? (
                  <span className="experiment-iterations">
                    {t({ zh: `${item.versionCount} 版迭代`, en: `${item.versionCount} iterations` })}
                  </span>
                ) : null}
                <time dateTime={item.date}>{item.date}</time>
              </header>
              <h3>
                {item.sourceOnly ? (
                  <span>{language === "zh" ? item.title.zh : item.title.en}</span>
                ) : (
                  <a href={item.href}>{language === "zh" ? item.title.zh : item.title.en}</a>
                )}
              </h3>
              <p>{language === "zh" ? item.summary.zh : item.summary.en}</p>
              <div className="tag-row">{item.tags.map((one) => <span key={one}>{one}</span>)}</div>
              <footer>
                {item.sourceOnly ? (
                  <a href={item.href} className="experiment-open is-source">
                    {t({ zh: "只有原始碼", en: "Source only" })} ↗
                  </a>
                ) : (
                  <a href={item.href} className="experiment-open">{t({ zh: "開啟", en: "Open" })} ↗</a>
                )}
                {item.externalHosts.length ? (
                  <span className="experiment-note" title={item.externalHosts.join(", ")}>
                    {t({ zh: "載入外部字型", en: "loads web fonts" })}
                  </span>
                ) : null}
              </footer>
            </article>
          ))}
        </section>
      ) : (
        <PendingPanel
          code="FILTER / 00"
          title={{ zh: "沒有符合的實驗。", en: "No experiment matches." }}
          note={{ zh: "換個關鍵字或標籤。", en: "Try another keyword or tag." }}
        />
      )}
    </main>
  );
}
