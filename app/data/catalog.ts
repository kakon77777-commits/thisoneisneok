import { type LocalizedText } from "./site";

export type LifeCycle = "concept" | "prototype" | "evolving" | "semi-stable" | "archived";

export type CatalogItem = {
  slug: string;
  category: "application" | "experiment" | "open-source" | "formalization";
  accent: "cyan" | "violet" | "amber" | "green";
  title: LocalizedText;
  summary: LocalizedText;
  version: string;
  phase: LifeCycle;
  updated: string;
  tags: string[];
  href: string;
  canonicalUrl: string;
  externalUrl?: string;
  sourceUrl?: string;
  proof?: LocalizedText;
};

// Experimental applications. Cleared 2026-07-31: every entry here is added only
// when the project is real, reachable, and worth opening. No placeholder cards.
export const applications: CatalogItem[] = [];

// Papers and Lean4 formalization. Cleared 2026-07-31 for the same reason.
export const leanProjects: CatalogItem[] = [];

// Books moved to books/manifest.json + app/data/books.generated.ts on 2026-07-31.
// The hand-written list here described them as "in revision" and "evolving
// edition" while every one of them was already published on Amazon, and it had
// no links at all.

export const phaseLabels = {
  concept: { zh: "概念", en: "Concept" },
  prototype: { zh: "原型", en: "Prototype" },
  evolving: { zh: "演化中", en: "Evolving" },
  "semi-stable": { zh: "半穩定", en: "Semi-stable" },
  archived: { zh: "封存", en: "Archived" },
} satisfies Record<LifeCycle, LocalizedText>;
