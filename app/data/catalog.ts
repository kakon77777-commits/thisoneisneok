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

export const books = [
  {
    title: { zh: "地球升級指南", en: "Guide to Upgrading Earth" },
    subtitle: { zh: "行星外科手術與地質工程的未來", en: "Planetary Surgery and the Future of Geoengineering" },
    phase: { zh: "重構中", en: "In revision" },
    image: "/media/books/earth-guide.webp",
  },
  {
    title: { zh: "AI 教我的事", en: "What AI Taught Me" },
    subtitle: { zh: "宇宙最努力的智慧體給人類的啟示", en: "Lessons from the Universe's Most Persistent Learner" },
    phase: { zh: "版本演化中", en: "Evolving edition" },
    image: "/media/books/ai-taught-me.webp",
  },
  {
    title: { zh: "瞬間的平等", en: "Equality of the Instant" },
    subtitle: { zh: "為什麼我們本質相同，卻活得如此不同", en: "Why Similar Beings Live So Differently" },
    phase: { zh: "版本演化中", en: "Evolving edition" },
    image: "/media/books/equality.webp",
  },
  {
    title: { zh: "情緒清醒術", en: "Emotional Clarity" },
    subtitle: { zh: "從焦慮到行動的決策方法", en: "A Decision Method from Anxiety to Action" },
    phase: { zh: "重構中", en: "In revision" },
    image: "/media/books/emotional-clarity.webp",
  },
  {
    title: { zh: "語言的秘密", en: "The Secrets of Language" },
    subtitle: { zh: "語言選擇背後的認知訊號", en: "Cognitive Signals Behind Language Choice" },
    phase: { zh: "國際版重構中", en: "International edition in revision" },
    image: "/media/books/language.webp",
  },
  {
    title: { zh: "無界策", en: "Strategy Without Boundaries" },
    subtitle: { zh: "從創世到歸零的策略架構", en: "A Strategic Architecture from Genesis to Zero" },
    phase: { zh: "翻譯與重構中", en: "Translation and revision" },
    image: "/media/books/wujiece.webp",
  },
];

export const phaseLabels = {
  concept: { zh: "概念", en: "Concept" },
  prototype: { zh: "原型", en: "Prototype" },
  evolving: { zh: "演化中", en: "Evolving" },
  "semi-stable": { zh: "半穩定", en: "Semi-stable" },
  archived: { zh: "封存", en: "Archived" },
} satisfies Record<LifeCycle, LocalizedText>;
