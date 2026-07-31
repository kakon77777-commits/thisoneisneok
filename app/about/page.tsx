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
        <div className="profile-image"><Image src="/media/profile/neok.webp" alt="Neo.K abstract silhouette" fill sizes="(max-width: 800px) 100vw, 42vw" priority unoptimized /></div>
        <div className="profile-copy">
          <p className="eyebrow">POSITION</p>
          <h2>{t({ zh: "我不需要把所有內容塞進同一個網站。", en: "I do not need to put everything into one website." })}</h2>
          <p>{t({
            zh: "完整的網站群、研究語料與產品線由 evemiss.com 與 evemisslab.com 兩個入口承接；這個網站只保留個人文字、實驗性小應用、MSSP、Lean4 與少量仍值得展示的作品。分工本身就是降低維護成本的一部分。",
            en: "The full network of sites, research corpora, and product lines is reached through evemiss.com and evemisslab.com. This site keeps only personal writing, small experimental applications, MSSP, Lean4, and a few works still worth presenting. Separation is itself part of reducing maintenance.",
          })}</p>
          <div className="profile-facts">
            <div><span>{t({ zh: "組織", en: "Organization" })}</span><strong>EVEMISS Technology Co., Ltd.</strong></div>
            <div><span>{t({ zh: "研究品牌", en: "Research brand" })}</span><strong>EveMissLab</strong></div>
            <div><span>{t({ zh: "個人網址", en: "Personal URL" })}</span><strong>https://thisoneisneok.com/</strong></div>
          </div>
        </div>
      </section>

      <section className="link-ledger">
        <a href="https://evemiss.com/"><span>01</span><div><strong>evemiss.com</strong><small>{t({ zh: "主要導航站，通往大部分網站群", en: "Main navigation site, reaching most of the network" })}</small></div><b>↗</b></a>
        <a href="https://evemisslab.com/"><span>02</span><div><strong>evemisslab.com</strong><small>{t({ zh: "研究與應用品牌入口", en: "Research and application brand entrance" })}</small></div><b>↗</b></a>
      </section>
    </main>
  );
}
