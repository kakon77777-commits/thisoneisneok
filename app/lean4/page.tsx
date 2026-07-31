"use client";

import { PageIntro } from "../components/page-intro";
import { PendingPanel } from "../components/pending-panel";
import { leanProjects, phaseLabels } from "../data/catalog";
import { useLanguage } from "../components/language-context";

export default function Lean4Page() {
  const { t } = useLanguage();
  return (
    <main className="page-main">
      <PageIntro
        eyebrow={{ zh: "形式化驗證", en: "Formalization" }}
        title={{ zh: "論文在這裡不是主角；證明工作才是。", en: "Papers are not the main event here; proof work is." }}
        description={{
          zh: "每個項目把必要論文、定義、Lean4 原始檔、驗證邊界與失敗狀態放在同一個固定位置。",
          en: "Each project keeps necessary papers, definitions, Lean4 source, proof boundaries, and failed states at one fixed location.",
        }}
        aside={<div className="proof-aside"><span>LEAN</span><b>4</b><small>PROOF / SOURCE</small></div>}
      />

      {leanProjects.length ? null : (
        <PendingPanel
          code="PROOF / 00"
          title={{
            zh: "先前的形式化條目已移除，這裡等待實際的證明檔案。",
            en: "The earlier formalization entries were removed; this page is waiting for real proof files.",
          }}
          note={{
            zh: "只列出能對應到具體 Lean4 原始檔、明確版本與明確驗證邊界的項目。論文會作為理解證明所必需的配套一起放上來，而不是反過來。",
            en: "Only entries backed by concrete Lean4 sources, an explicit version, and an explicit proof boundary are listed. Papers arrive as the companion material needed to read a proof, not the other way round.",
          }}
        />
      )}

      <section className="proof-list">
        {leanProjects.map((item, index) => (
          <article id={item.slug} key={item.slug} className={`accent-${item.accent}`}>
            <div className="proof-index">0{index + 1}</div>
            <div className="proof-main">
              <div className="project-meta"><span className="phase-pill">{t(phaseLabels[item.phase])}</span><span>{item.version}</span></div>
              <h2>{t(item.title)}</h2>
              <p>{t(item.summary)}</p>
              <div className="tag-row">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            </div>
            <aside>
              <span>{t({ zh: "驗證狀態", en: "Proof status" })}</span>
              <strong>{item.proof ? t(item.proof) : "—"}</strong>
              <code>{item.canonicalUrl}</code>
            </aside>
          </article>
        ))}
      </section>

      <section className="formalization-note">
        <p className="eyebrow">VERSION BOUNDARY</p>
        <h2>{t({ zh: "「已驗證」永遠只對應特定版本與特定形式化邊界。", en: "Verified always refers to a specific version and formal boundary." })}</h2>
        <p>{t({
          zh: "理論本文可以繼續改寫；Lean4 結果則必須清楚標示它驗證的是哪一組定義、公理與程式碼版本。",
          en: "A theory can continue to be rewritten; Lean4 results must state exactly which definitions, axioms, and source version they verify.",
        })}</p>
      </section>
    </main>
  );
}
