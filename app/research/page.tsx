"use client";

import Link from "next/link";
import { PageIntro } from "../components/page-intro";
import { useLanguage } from "../components/language-context";
import { researchPapers, researchCount, researchDirectionNote } from "../data/research.generated";

export default function ResearchPage() {
  const { language, t } = useLanguage();

  return (
    <main className="page-main research-page">
      <PageIntro
        eyebrow={{ zh: "程式研究區", en: "Programming research" }}
        title={{
          zh: "MSSP 接下來要長成什麼。",
          en: "What MSSP is growing into next.",
        }}
        description={{
          zh: "這一區不是 MSSP 現況的說明，是它下一批版本的材料。四個方向各有一份研究草案：AI 管理、EveMiss FPL 專案形式化語言、架構可視化，以及動態／規模感知的 MSSP。",
          en: "This is not documentation of what MSSP is today; it is the material for its next versions. One research draft per direction: AI management, EveMiss FPL, architecture visualisation, and a dynamic, scale-aware MSSP.",
        }}
        aside={<div className="metric-card"><strong>{researchCount}</strong><span>{t({ zh: "研究草案", en: "research drafts" })}</span></div>}
      />

      <section className="research-note">
        <p className="eyebrow">FOUR DIRECTIONS</p>
        <p>{language === "zh" ? researchDirectionNote.zh : researchDirectionNote.en}</p>
        <Link href="/mssp" className="text-link">{t({ zh: "回到 MSSP 專區", en: "Back to the MSSP field lab" })} ↗</Link>
      </section>

      <ol className="research-list">
        {researchPapers.map((paper) => (
          <li key={paper.slug}>
            <div className="research-direction">
              <span>{language === "zh" ? paper.direction.zh : paper.direction.en}</span>
            </div>
            <div className="research-body">
              <h2><a href={paper.href}>{language === "zh" ? paper.title.zh : paper.title.en}</a></h2>
              {paper.subtitle ? (
                <p className="research-subtitle">{language === "zh" ? paper.subtitle.zh : paper.subtitle.en}</p>
              ) : null}
              <p>{language === "zh" ? paper.summary.zh : paper.summary.en}</p>
              {paper.relatesTo ? (
                <p className="research-relates">
                  <b>{t({ zh: "與 MSSP 的關係", en: "Relation to MSSP" })}</b>
                  {language === "zh" ? paper.relatesTo.zh : paper.relatesTo.en}
                </p>
              ) : null}
              {paper.nameStatus === "provisional" ? (
                <p className="research-provisional">
                  {t({ zh: "名稱暫定", en: "Name provisional" })} — {language === "zh" ? paper.nameNote?.zh : paper.nameNote?.en}
                </p>
              ) : null}
              {paper.formerName ? (
                <p className="research-former">
                  {t({ zh: "更名", en: "Renamed" })} — {language === "zh" ? paper.formerName.zh : paper.formerName.en}
                </p>
              ) : null}
              <p className="research-meta">
                {[
                  language === "zh" ? paper.status.zh : paper.status.en,
                  paper.date,
                  `${paper.charCount.toLocaleString()} ${t({ zh: "字", en: "chars" })}`,
                  `${paper.sectionCount} ${t({ zh: "節", en: "sections" })}`,
                ].join("  ·  ")}
              </p>
            </div>
            <div className="research-formats">
              <a href={paper.href}>{t({ zh: "閱讀", en: "Read" })} ↗</a>
              <a href={paper.mdUrl}>MD ↓</a>
            </div>
          </li>
        ))}
      </ol>

      <section className="source-banner">
        <div><span>AI / INDEX</span><h2>{t({ zh: "機器可讀的研究索引。", en: "A machine-readable research index." })}</h2></div>
        <p>{t({
          zh: "四個方向、狀態與兩種格式網址都收在同一份 JSON。名稱未定案的項目會標明。",
          en: "The four directions, each draft's status, and both format URLs live in one JSON file. Entries without a settled name say so.",
        })}</p>
        <a href="https://thisoneisneok.com/ai/research-index.json">{t({ zh: "開啟研究索引", en: "Open the research index" })} ↗</a>
      </section>
    </main>
  );
}
