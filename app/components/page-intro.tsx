"use client";

import type { ReactNode } from "react";
import type { LocalizedText } from "../data/site";
import { useLanguage } from "./language-context";

export function PageIntro({
  eyebrow,
  title,
  description,
  aside,
}: {
  eyebrow: LocalizedText;
  title: LocalizedText;
  description: LocalizedText;
  aside?: ReactNode;
}) {
  const { t } = useLanguage();
  return (
    <section className="page-intro">
      <div>
        <p className="eyebrow">{t(eyebrow)}</p>
        <h1>{t(title)}</h1>
        <p className="lede">{t(description)}</p>
      </div>
      {aside ? <aside>{aside}</aside> : null}
    </section>
  );
}
