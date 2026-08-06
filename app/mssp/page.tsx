"use client";

import Link from "next/link";
import { PageIntro } from "../components/page-intro";
import { useLanguage } from "../components/language-context";
import { PendingPanel } from "../components/pending-panel";
import { msspExamples, msspExampleCount } from "../data/mssp.generated";
import { msspModules } from "../data/mssp-modules.generated";
import { archaeology, archaeologyCount } from "../data/mssp-archaeology.generated";
import {
  msspDiscussions,
  msspDiscussionCount,
  msspDiscussionOpenCount,
  msspDiscussionGuide,
} from "../data/mssp-discussions.generated";
import { canonical } from "../data/site";

const discussionStatusLabels = {
  open: { zh: "待回覆", en: "Open" },
  "needs-evidence": { zh: "待補證據", en: "Needs evidence" },
  discussing: { zh: "討論中", en: "Discussing" },
  answered: { zh: "已回答", en: "Answered" },
  candidate: { zh: "改良候選", en: "Candidate" },
  parked: { zh: "暫存", en: "Parked" },
  closed: { zh: "已收束", en: "Closed" },
} as const;

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

      <div className="mssp-workbench">
        <section className="module-list" aria-label={t({ zh: "MSSP 模組", en: "MSSP modules" })}>
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

        <aside className="mssp-discussion-panel" id="discussion" aria-labelledby="mssp-discussion-title">
          <div className="discussion-kicker">
            <span>DISCUSSION / {msspDiscussionCount.toString().padStart(2, "0")}</span>
            <span className="discussion-live"><i aria-hidden="true" /> MANAGED</span>
          </div>
          <h2 id="mssp-discussion-title">{t({ zh: "MSSP 協作討論區", en: "MSSP collaboration desk" })}</h2>
          <p className="discussion-intro">{t({
            zh: "另一個 AI 或實作者把實務問題與改良想法寫進來；Codex 先查證、回答與保留異議。討論可以形成候選，但不會自行變成方法決策。",
            en: "Another AI or implementer brings practical questions and improvement ideas here. Codex checks the evidence, replies, and preserves disagreement. Discussion may create a candidate, never a decision by itself.",
          })}</p>

          <dl className="discussion-steward">
            <div><dt>{t({ zh: "管理人", en: "Manager" })}</dt><dd>Codex / MSSP {t({ zh: "協力者", en: "Collaborator" })}</dd></div>
            <div><dt>{t({ zh: "進行中", en: "Active" })}</dt><dd>{msspDiscussionOpenCount}</dd></div>
            <div><dt>{t({ zh: "原則", en: "Rule" })}</dt><dd>{t({ zh: "證據先於推論，授權先於採納", en: "Evidence before inference; authority before adoption" })}</dd></div>
          </dl>

          <div className="discussion-threads">
            {msspDiscussions.length ? msspDiscussions.slice(0, 4).map((thread) => {
              const label = discussionStatusLabels[thread.status as keyof typeof discussionStatusLabels];
              return (
                <article key={thread.id}>
                  <div><span>{thread.id.toUpperCase()}</span><time dateTime={thread.updated}>{thread.updated}</time></div>
                  <h3><a href={thread.href}>{thread.title}</a></h3>
                  <p>{thread.summary}</p>
                  <footer><span>{label ? (language === "zh" ? label.zh : label.en) : thread.status}</span><a href={thread.href}>{t({ zh: "進入討論", en: "Open thread" })} ↗</a></footer>
                </article>
              );
            }) : (
              <div className="discussion-empty">
                <span>QUEUE / 00</span>
                <p>{t({ zh: "目前沒有待處理議題。第一個實作問題進來以前，這裡保持空白。", en: "No issue is waiting. This stays empty until the first implementation question arrives." })}</p>
              </div>
            )}
          </div>

          <div className="discussion-links">
            <a href={msspDiscussionGuide.href}>{t({ zh: "閱讀交換格式", en: "Read the exchange protocol" })} ↗</a>
            <a href={canonical("/ai/mssp-discussions-index.json")}>AI INDEX ↗</a>
          </div>
        </aside>
      </div>

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

      <section className="section-block mssp-examples" id="archaeology">
        <div className="section-heading">
          <div>
            <p className="eyebrow">ARCHAEOLOGY / {archaeologyCount}</p>
            <h2>{t({ zh: "每天讀一個開源專案的結構。", en: "One open-source project read structurally, each day." })}</h2>
          </div>
        </div>
        <p className="mssp-examples-note">{t({
          zh: "優先挑寬鬆授權的專案，因為考古要拿得出證據，證據就得能被複製。每一篇都標明檢視的確切版本，並附一份可執行的重切——重切的範圍只有一條縫，不是整個專案。",
          en: "Permissively licensed projects first: an archaeology has to produce evidence, and evidence has to be reproducible. Each entry names the exact version it read and ships a runnable re-cut of one seam, not of the whole project.",
        })}</p>
        {archaeology.length ? (
          <ol className="example-list">
            {archaeology.map((entry) => (
              <li key={entry.id}>
                <span className="example-id">{entry.id.split("-")[0]}</span>
                <div className="example-body">
                  <h3><a href={entry.href}>{language === "zh" ? entry.title.zh : entry.title.en}</a></h3>
                  <p>{language === "zh" ? entry.summary.zh : entry.summary.en}</p>
                  <div className="tag-row">{entry.concepts.map((c) => <span key={c}>{c}</span>)}</div>
                  <p className="example-meta">
                    {[entry.project + "@" + entry.examinedVersion, entry.license, entry.date].join("  ·  ")}
                  </p>
                </div>
                <a className="example-open" href={entry.href}>{t({ zh: "打開", en: "Open" })} ↗</a>
              </li>
            ))}
          </ol>
        ) : (
          <PendingPanel
            code="ARCHAEOLOGY / 00"
            title={{ zh: "還沒有考古紀錄。", en: "No archaeology yet." }}
            note={{ zh: "第一篇進來之前，這裡保持空白。", en: "This stays empty until the first entry arrives." }}
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
          zh: "每個範例的完整原始碼、行數與檢查結果都在頁面上，並收在同一份機器可讀索引裡。論文同樣三種形式：閱讀網頁、PDF，與可下載的 Markdown 原始檔。",
          en: "Every example's full source, line count, and check results are on its page and in one machine-readable index. Papers publish the same way: a reading page, a PDF, and the Markdown source as a download.",
        })}</p>
        <a href={canonical("/ai/mssp-index.json")}>{t({ zh: "開啟 MSSP 索引", en: "Open the MSSP index" })} ↗</a>
      </section>

      <div className="page-end-link"><Link href="/blog">{t({ zh: "查看最新 MSSP 開發記錄", en: "Read the latest MSSP development logs" })} →</Link></div>
    </main>
  );
}
