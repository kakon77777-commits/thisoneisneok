"use client";

import Link from "next/link";
import { PageIntro } from "../components/page-intro";
import { useLanguage } from "../components/language-context";
import { PendingPanel } from "../components/pending-panel";
import { msspExamples, msspExampleCount } from "../data/mssp.generated";
import { msspModules } from "../data/mssp-modules.generated";
import { canonical } from "../data/site";

export default function MSSPPage() {
  const { language, t } = useLanguage();
  return (
    <main className="page-main mssp-page">
      <PageIntro
        eyebrow={{ zh: "主要專區／持續推進", en: "Primary field / continuous work" }}
        title={{ zh: "MSSP：讓複雜專案重新變得可觀察。", en: "MSSP: making complex projects observable again." }}
        description={{
          zh: "這裡不只展示成果，也保存方法、失敗、重構與版本演化。MSSP 將透過開源專案與自製實作被反覆驗證、修正與教學化。",
          en: "This field preserves methods, failures, reconstructions, and version evolution—not just outcomes. MSSP is repeatedly tested, corrected, and taught through open-source and original implementations.",
        }}
        aside={<div className="mssp-seal"><b>MSSP</b><span>FIELD MANUAL</span><small>VERSIONED / BILINGUAL</small></div>}
      />

      <section className="mssp-definition">
        <div className="definition-number">00</div>
        <div>
          <p className="eyebrow">WORKING DEFINITION</p>
          <h2>{t({ zh: "不是把程式切碎，而是讓狀態的邊界可以被看見與操作。", en: "Not breaking software apart, but making state boundaries visible and operable." })}</h2>
        </div>
        <p>{t({
          zh: "本區暫時保留工作性定義。隨著 Evennia、遊戲運行框架、視覺狀態編輯器與自主 Agent 實驗推進，定義與方法會繼續修訂。",
          en: "This area intentionally keeps a working definition. As Evennia, game runtimes, visual state editors, and autonomous-agent experiments advance, the definition and methods will continue to change.",
        })}</p>
      </section>

      <section className="module-list">
        {msspModules.map((module) => (
          <a id={module.id} key={module.id} href={module.href}>
            <span className="module-index">{module.index}</span>
            <div>
              <h2>{language === "zh" ? module.title.zh : module.title.en}</h2>
              <p>{language === "zh" ? module.summary.zh : module.summary.en}</p>
            </div>
            <span className="module-state">{language === "zh" ? module.state.zh : module.state.en}</span>
            <span className="module-arrow" aria-hidden="true">↘</span>
          </a>
        ))}
      </section>

      <section className="section-block mssp-examples" id="examples">
        <div className="section-heading">
          <div>
            <p className="eyebrow">EXAMPLES / {msspExampleCount}</p>
            <h2>{t({ zh: "每個範例只示範一個結構決策。", en: "One structural decision per example." })}</h2>
          </div>
        </div>
        <p className="mssp-examples-note">{t({
          zh: "每個範例都可以實際執行，並在建置時被機械檢查：沒有任何 TMS 引用另一個 TMS，沒有空的集合目錄，README 必須寫出這個範例「沒有解決什麼」。檢查失敗就不會發佈。",
          en: "Every example runs, and is checked mechanically at build time: no TMS imports another TMS, no set directory is empty, and the README must state what the example does not solve. A failing check blocks publication.",
        })}</p>
        {msspExamples.length ? (
          <ol className="example-list">
            {msspExamples.map((example) => (
              <li key={example.id}>
                <span className="example-id">{example.id.split("-")[0]}</span>
                <div className="example-body">
                  <h3><a href={example.htmlUrl}>{language === "zh" ? example.title.zh : example.title.en}</a></h3>
                  <p>{language === "zh" ? example.summary.zh : example.summary.en}</p>
                  <div className="tag-row">
                    {example.concepts.map((concept) => <span key={concept}>{concept}</span>)}
                  </div>
                  <p className="example-meta">
                    {[example.language, example.version, example.date, `${example.lineCount} lines`].join("  ·  ")}
                    {example.kind === "counterexample" ? "  ·  COUNTEREXAMPLE" : ""}
                  </p>
                </div>
                <a className="example-open" href={example.htmlUrl}>{t({ zh: "打開", en: "Open" })} ↗</a>
              </li>
            ))}
          </ol>
        ) : (
          <PendingPanel
            code="EXAMPLES / 00"
            title={{ zh: "還沒有範例。", en: "No examples yet." }}
            note={{ zh: "第一個範例進來之前，這裡保持空白。", en: "This stays empty until the first example arrives." }}
          />
        )}
      </section>

      <section className="mssp-roadmap">
        <div>
          <p className="eyebrow">FIRST PUBLIC TRACK</p>
          <h2>{t({ zh: "第一條公開路線：從開源專案到 MSSP 重構。", en: "First public track: from open source to MSSP reconstruction." })}</h2>
        </div>
        <ol>
          <li><span>01</span>{t({ zh: "選擇專案並建立結構地圖", en: "Select a project and map its structure" })}</li>
          <li><span>02</span>{t({ zh: "辨識狀態、事件與不可替換耦合", en: "Identify state, events, and irreducible coupling" })}</li>
          <li><span>03</span>{t({ zh: "製作 MSSP 對照版本與教學", en: "Build an MSSP comparison and tutorial" })}</li>
          <li><span>04</span>{t({ zh: "發佈原始碼、版本與反例", en: "Publish source, versions, and counterexamples" })}</li>
        </ol>
      </section>

      <section className="source-banner">
        <div><span>AI / SOURCE</span><h2>{t({ zh: "人類讀網頁，AI 讀原始結構。", en: "Humans read pages; AI reads source structure." })}</h2></div>
        <p>{t({
          zh: "每個範例的完整原始碼、行數與檢查結果都在頁面上，並收在同一份機器可讀索引裡。論文只以 HTML 與 PDF 發表，Markdown 不對外發佈。",
          en: "Every example's full source, line count, and check results are on its page and in one machine-readable index. Papers publish as HTML and PDF only; their Markdown is not distributed.",
        })}</p>
        <a href={canonical("/ai/mssp-index.json")}>{t({ zh: "開啟 MSSP 索引", en: "Open the MSSP index" })} ↗</a>
      </section>

      <div className="page-end-link"><Link href="/blog">{t({ zh: "查看最新 MSSP 開發記錄", en: "Read the latest MSSP development logs" })} →</Link></div>
    </main>
  );
}
