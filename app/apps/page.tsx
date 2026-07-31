"use client";

import { useMemo, useState } from "react";
import { applications } from "../data/catalog";
import { ProjectCard } from "../components/project-card";
import { PageIntro } from "../components/page-intro";
import { PendingPanel } from "../components/pending-panel";
import { useLanguage } from "../components/language-context";

const filters = ["all", "application", "experiment", "open-source"] as const;

export default function AppsPage() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const [query, setQuery] = useState("");
  const { language, t } = useLanguage();

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return applications.filter((item) => {
      const categoryMatch = filter === "all" || item.category === filter;
      const haystack = [item.title.zh, item.title.en, item.summary.zh, item.summary.en, ...item.tags]
        .join(" ")
        .toLowerCase();
      return categoryMatch && (!q || haystack.includes(q));
    });
  }, [filter, query]);

  const labels = {
    all: { zh: "全部", en: "All" },
    application: { zh: "應用", en: "Applications" },
    experiment: { zh: "實驗", en: "Experiments" },
    "open-source": { zh: "開源", en: "Open source" },
  };

  return (
    <main className="page-main">
      <PageIntro
        eyebrow={{ zh: "應用與實驗", en: "Applications & experiments" }}
        title={{ zh: "把研究暫時編譯成可被打開的東西。", en: "Temporarily compiling research into things that can be opened." }}
        description={{
          zh: "這裡只展示值得被操作、觀看或繼續開發的項目。狀態代表生命週期，不宣稱終極成熟。",
          en: "Only projects worth operating, viewing, or continuing appear here. Status describes lifecycle, not final maturity.",
        }}
        aside={
          applications.length
            ? <div className="metric-card"><strong>{visible.length}</strong><span>{t({ zh: "目前顯示", en: "currently shown" })}</span></div>
            : undefined
        }
      />

      {applications.length ? (
        <>
          <section className="catalog-controls">
            <label className="search-box">
              <span aria-hidden="true">⌕</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t({ zh: "搜尋名稱、標籤或說明", en: "Search names, tags, or descriptions" })}
              />
            </label>
            <div className="filter-row">
              {filters.map((item) => (
                <button
                  type="button"
                  onClick={() => setFilter(item)}
                  className={filter === item ? "is-active" : ""}
                  key={item}
                >
                  {labels[item][language]}
                </button>
              ))}
            </div>
          </section>

          <section className="project-grid catalog-grid">
            {visible.map((item, index) => <ProjectCard item={item} index={index} key={item.slug} />)}
          </section>
        </>
      ) : (
        <PendingPanel
          code="CATALOG / 00"
          title={{
            zh: "目錄已清空，等待第一個真正可以操作的項目。",
            en: "The catalog is cleared, waiting for the first genuinely operable entry.",
          }}
          note={{
            zh: "先前的示範項目多數只有名稱與一段說明，沒有可打開的東西，因此全部移除。之後進來的每一個項目都會帶著可用的連結、版本與更新日期。搜尋與分類會在第一個項目進駐時一起回來。",
            en: "Most earlier entries had a name and a paragraph but nothing to open, so they were removed. Every entry from here on arrives with a working link, a version, and an update date. Search and filtering return with the first real entry.",
          }}
          action={{ href: "/mssp", label: { zh: "前往 MSSP 專區", en: "Go to the MSSP field lab" } }}
        />
      )}
    </main>
  );
}
