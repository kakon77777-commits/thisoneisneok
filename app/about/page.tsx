"use client";

import Image from "next/image";
import { PageIntro } from "../components/page-intro";
import { useLanguage } from "../components/language-context";

export default function AboutPage() {
  const { t } = useLanguage();
  return (
    <main className="page-main about-page">
      <PageIntro
        eyebrow={{ zh: "作者／創辦人", en: "Author / founder" }}
        title={{ zh: "Neo.K — 許筌崴", en: "Neo.K — Chuan-Wei Hsu" }}
        description={{
          zh: "一言諾科技有限公司與 EveMissLab 創辦人。以跨領域研究、系統設計與持續實作，探索理論如何轉化成可操作的世界。",
          en: "Founder of EVEMISS Technology and EveMissLab, exploring how theory becomes an operable world through interdisciplinary research, system design, and continuous implementation.",
        }}
      />

      <section className="profile-layout">
        <div className="profile-image"><Image src="/media/profile/neok.png" alt="Neo.K abstract silhouette" fill sizes="(max-width: 800px) 100vw, 42vw" priority /></div>
        <div className="profile-copy">
          <p className="eyebrow">POSITION</p>
          <h2>{t({ zh: "我不需要把所有內容塞進同一個網站。", en: "I do not need to put everything into one website." })}</h2>
          <p>{t({
            zh: "Logic Matrix 保存深層理論語料；這個網站則保留個人文字、應用、MSSP、Lean4 與少量仍值得展示的作品。分工本身就是降低維護成本的一部分。",
            en: "Logic Matrix preserves the deep theory corpus. This site keeps personal writing, applications, MSSP, Lean4, and a small set of works still worth presenting. Separation is itself part of reducing maintenance.",
          })}</p>
          <div className="profile-facts">
            <div><span>{t({ zh: "組織", en: "Organization" })}</span><strong>EVEMISS Technology Co., Ltd.</strong></div>
            <div><span>{t({ zh: "研究品牌", en: "Research brand" })}</span><strong>EveMissLab</strong></div>
            <div><span>{t({ zh: "個人網址", en: "Personal URL" })}</span><strong>https://thisoneisneok.com/</strong></div>
          </div>
        </div>
      </section>

      <section className="link-ledger">
        <a href="https://logic.evemisslab.com/"><span>01</span><div><strong>Logic Matrix</strong><small>{t({ zh: "理論語料庫與時間線", en: "Theory corpus and timeline" })}</small></div><b>↗</b></a>
        <a href="https://evemisslab.com/"><span>02</span><div><strong>EveMissLab</strong><small>{t({ zh: "研究與應用品牌", en: "Research and application brand" })}</small></div><b>↗</b></a>
        <a href="https://evemisstechnology.com/"><span>03</span><div><strong>EVEMISS Technology</strong><small>{t({ zh: "企業入口", en: "Company entrance" })}</small></div><b>↗</b></a>
      </section>
    </main>
  );
}
