"use client";

import Link from "next/link";
import type { LocalizedText } from "../data/site";
import { useLanguage } from "./language-context";

/**
 * Honest empty state. A section that has no entries yet says so, instead of
 * rendering an empty grid or a placeholder card that claims work exists.
 */
export function PendingPanel({
  code,
  title,
  note,
  action,
}: {
  code: string;
  title: LocalizedText;
  note: LocalizedText;
  action?: { href: string; label: LocalizedText };
}) {
  const { t } = useLanguage();
  return (
    <section className="pending-panel">
      <span className="pending-code">{code}</span>
      <div>
        <h3>{t(title)}</h3>
        <p>{t(note)}</p>
        {action ? (
          <Link href={action.href} className="text-link">
            {t(action.label)} <span>↗</span>
          </Link>
        ) : null}
      </div>
    </section>
  );
}
