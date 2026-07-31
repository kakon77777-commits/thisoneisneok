"use client";

import Link from "next/link";
import type { CatalogItem } from "../data/catalog";
import { phaseLabels } from "../data/catalog";
import { useLanguage } from "./language-context";

export function ProjectCard({ item, index = 0 }: { item: CatalogItem; index?: number }) {
  const { language, t } = useLanguage();

  return (
    <article className={`project-card accent-${item.accent}`} style={{ "--order": index } as React.CSSProperties}>
      <div className="project-visual" aria-hidden="true">
        <span>{String(index + 1).padStart(2, "0")}</span>
        <i />
      </div>
      <div className="project-body">
        <div className="project-meta">
          <span className="phase-pill">{t(phaseLabels[item.phase])}</span>
          <span>{item.version}</span>
        </div>
        <h3>{t(item.title)}</h3>
        <p>{t(item.summary)}</p>
        <div className="tag-row">
          {item.tags.slice(0, 3).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <div className="card-actions">
          <Link href={item.href} data-canonical-url={item.canonicalUrl}>
            {language === "zh" ? "開啟項目" : "Open project"}
            <span aria-hidden="true">↗</span>
          </Link>
          <time dateTime={item.updated}>{item.updated}</time>
        </div>
      </div>
    </article>
  );
}
