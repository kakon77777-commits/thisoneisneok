"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { LanguageProvider, useLanguage } from "./language-context";
import { canonical } from "../data/site";

const navigation = [
  { href: "/", zh: "首頁", en: "Home" },
  { href: "/papers", zh: "論文", en: "Papers" },
  { href: "/apps", zh: "應用", en: "Apps" },
  { href: "/mssp", zh: "MSSP", en: "MSSP" },
  { href: "/lean4", zh: "Lean4", en: "Lean4" },
  { href: "/blog", zh: "部落格", en: "Blog" },
  { href: "/about", zh: "關於", en: "About" },
];

function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="site-frame">
      <header className="site-header">
        <Link href="/" className="brand" aria-label="Neo.K home">
          <span className="brand-mark">N·K</span>
          <span className="brand-copy">
            <strong>Neo.K</strong>
            <small>× EveMissLab</small>
          </span>
        </Link>

        <nav className="site-nav" aria-label={t({ zh: "主要導覽", en: "Main navigation" })}>
          {navigation.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                href={item.href}
                key={item.href}
                className={active ? "nav-link is-active" : "nav-link"}
              >
                {language === "zh" ? item.zh : item.en}
              </Link>
            );
          })}
        </nav>

        <div className="language-switch" aria-label={t({ zh: "語言", en: "Language" })}>
          <button
            type="button"
            className={language === "zh" ? "is-active" : ""}
            onClick={() => setLanguage("zh")}
          >
            中
          </button>
          <span>/</span>
          <button
            type="button"
            className={language === "en" ? "is-active" : ""}
            onClick={() => setLanguage("en")}
          >
            EN
          </button>
        </div>
      </header>

      {children}

      <footer className="site-footer">
        <div>
          <strong>Neo.K × EveMissLab</strong>
          <p>{t({ zh: "個人記錄、研究應用與 MSSP 實驗場。", en: "Personal records, research applications, and the MSSP field lab." })}</p>
        </div>
        <div className="footer-links">
          <a href="https://evemiss.com/">evemiss.com</a>
          <a href="https://evemisslab.com/">evemisslab.com</a>
          <a href={canonical("/ai/site-index.md")}>AI Index</a>
          <a href={canonical("/llms.txt")}>llms.txt</a>
        </div>
      </footer>
    </div>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <Shell>{children}</Shell>
    </LanguageProvider>
  );
}
