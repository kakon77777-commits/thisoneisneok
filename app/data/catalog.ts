import { canonical, type LocalizedText } from "./site";

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

export const applications: CatalogItem[] = [
  {
    slug: "eveglyph-editor",
    category: "application",
    accent: "cyan",
    title: { zh: "EveGlyph Editor", en: "EveGlyph Editor" },
    summary: {
      zh: "面向狀態、符號與世界結構的可視化編輯器，也是 MSSP 工作流的重要實驗介面。",
      en: "A visual editor for states, symbols, and world structures, and an experimental interface for MSSP workflows.",
    },
    version: "v0.x",
    phase: "evolving",
    updated: "2026-07-16",
    tags: ["MSSP", "STATE", "EDITOR"],
    href: "/apps/eveglyph-editor",
    canonicalUrl: canonical("/apps/eveglyph-editor"),
    externalUrl: "https://eveglypheditor.com/",
  },
  {
    slug: "phosphor",
    category: "application",
    accent: "green",
    title: { zh: "PHOSPHOR", en: "PHOSPHOR" },
    summary: {
      zh: "邊緣 VM 與基礎設施的互動展示台，將系統層級拆解成可閱讀的視覺介面。",
      en: "An interactive edge-VM and infrastructure observatory that makes system layers visually readable.",
    },
    version: "v0.2",
    phase: "evolving",
    updated: "2026-06-30",
    tags: ["EDGE", "VM", "INFRA"],
    href: "/apps/phosphor",
    canonicalUrl: canonical("/apps/phosphor"),
    externalUrl: "https://emlphosphor.com/",
  },
  {
    slug: "eml",
    category: "application",
    accent: "violet",
    title: { zh: "EML 語言系統", en: "EML Language System" },
    summary: {
      zh: "從語義附加、符號密度到可執行表達的語言工程實驗。",
      en: "A language-engineering experiment spanning semantic annotation, symbol density, and executable expression.",
    },
    version: "MVP",
    phase: "evolving",
    updated: "2026-06-30",
    tags: ["LANGUAGE", "SEMANTICS", "EML"],
    href: "/apps/eml",
    canonicalUrl: canonical("/apps/eml"),
    externalUrl: "https://httpefficientnewlanguage.org/",
  },
  {
    slug: "amf-measure-flow",
    category: "experiment",
    accent: "cyan",
    title: { zh: "AMF 測度流互動實驗室", en: "AMF Measure-Flow Lab" },
    summary: {
      zh: "魚群到測度流的三向互動實驗，展示 AFSA 解構與測度流重構。",
      en: "A three-way interactive experiment from swarms to measure flow, showing AFSA decomposition and reconstruction.",
    },
    version: "v0.1",
    phase: "prototype",
    updated: "2026-06-23",
    tags: ["AFSA", "LANGEVIN", "MEASURE"],
    href: "/apps/amf-measure-flow",
    canonicalUrl: canonical("/apps/amf-measure-flow"),
  },
  {
    slug: "worldmonitor-gfi",
    category: "experiment",
    accent: "cyan",
    title: { zh: "WorldMonitor GFI", en: "WorldMonitor GFI" },
    summary: {
      zh: "全球流速指數的公開展示原型，探索即時資料與邊緣部署。",
      en: "A public prototype for the Global Flow Index, exploring real-time data and edge deployment.",
    },
    version: "v0.1",
    phase: "prototype",
    updated: "2026-06-23",
    tags: ["GFI", "CLIMATE", "EDGE"],
    href: "/apps/worldmonitor-gfi",
    canonicalUrl: canonical("/apps/worldmonitor-gfi"),
  },
  {
    slug: "prime-notation",
    category: "experiment",
    accent: "amber",
    title: { zh: "素數位置記法引擎", en: "Prime Position Notation" },
    summary: {
      zh: "用可調基底探索素數密度與進位制相對性的互動介面。",
      en: "An adjustable-base interface for exploring prime density and numeral-system relativity.",
    },
    version: "demo-1",
    phase: "prototype",
    updated: "2026-06-23",
    tags: ["PRIME", "NUMBER", "NOTATION"],
    href: "/apps/prime-notation",
    canonicalUrl: canonical("/apps/prime-notation"),
  },
  {
    slug: "issql",
    category: "experiment",
    accent: "violet",
    title: { zh: "ISSQL 查詢介面", en: "ISSQL Query Interface" },
    summary: {
      zh: "無限光譜序列量化語言的互動查詢與可計算投影實驗。",
      en: "An interactive query and computable-projection experiment for infinite spectral sequence quantization.",
    },
    version: "v0.1",
    phase: "concept",
    updated: "2026-06-23",
    tags: ["ISSQL", "SPECTRUM", "QUERY"],
    href: "/apps/issql",
    canonicalUrl: canonical("/apps/issql"),
  },
  {
    slug: "bifurcation-observer",
    category: "open-source",
    accent: "green",
    title: { zh: "Bifurcation Observer", en: "Bifurcation Observer" },
    summary: {
      zh: "以分岔點定位、集中計算與收斂判斷構成的決策分析實作。",
      en: "A decision-analysis implementation built from bifurcation location, focused computation, and convergence checks.",
    },
    version: "v0.1",
    phase: "prototype",
    updated: "2026-06-23",
    tags: ["BIFURCATION", "DECISION", "PYTHON"],
    href: "/apps/bifurcation-observer",
    canonicalUrl: canonical("/apps/bifurcation-observer"),
  },
  {
    slug: "phase-space",
    category: "experiment",
    accent: "violet",
    title: { zh: "相空間嵌套動力學", en: "Nested Phase-Space Dynamics" },
    summary: {
      zh: "三層嵌套動力系統的互動可視化與認識論實驗。",
      en: "An interactive visualization and epistemic experiment for three-layer nested dynamical systems.",
    },
    version: "v0.1",
    phase: "concept",
    updated: "2026-06-23",
    tags: ["PHASE", "DYNAMICS", "EPISTEMOLOGY"],
    href: "/apps/phase-space",
    canonicalUrl: canonical("/apps/phase-space"),
  },
  {
    slug: "dco-closure",
    category: "experiment",
    accent: "amber",
    title: { zh: "DCO Closure 計算器", en: "DCO Closure Calculator" },
    summary: {
      zh: "動態圓本體論封閉算子的計算與投影實驗。",
      en: "A computational and projection experiment for Dynamic Circle Ontology closure operators.",
    },
    version: "v0.1",
    phase: "concept",
    updated: "2026-06-23",
    tags: ["DCO", "CLOSURE", "OPERATOR"],
    href: "/apps/dco-closure",
    canonicalUrl: canonical("/apps/dco-closure"),
  },
];

export const leanProjects: CatalogItem[] = [
  {
    slug: "eml-tc",
    category: "formalization",
    accent: "violet",
    title: { zh: "EML-TC 拓樸微積分", en: "EML-TC Topological Calculus" },
    summary: {
      zh: "同一性微積分的機器驗證套件；論文只作為定義、假設與證明邊界的配套說明。",
      en: "A machine-verification package for identity calculus; its paper documents definitions, assumptions, and proof boundaries.",
    },
    version: "v0.3",
    phase: "evolving",
    updated: "2026-06-23",
    tags: ["LEAN4", "TOPOLOGY", "CALCULUS"],
    href: "/lean4#eml-tc",
    canonicalUrl: canonical("/lean4#eml-tc"),
    proof: { zh: "階段 1–3 已驗證；對偶部分持續更新", en: "Stages 1–3 verified; duality work continues" },
  },
  {
    slug: "weaving-theory",
    category: "formalization",
    accent: "violet",
    title: { zh: "Weaving Theory 形式化", en: "Weaving Theory Formalization" },
    summary: {
      zh: "形態素代數、自然轉換與公理群的 Lean4 形式化工作區。",
      en: "A Lean4 workspace for morpheme algebra, natural transformations, and axiom groups.",
    },
    version: "v0.1",
    phase: "concept",
    updated: "2026-06-23",
    tags: ["LEAN4", "CATEGORY", "MORPHEME"],
    href: "/lean4#weaving-theory",
    canonicalUrl: canonical("/lean4#weaving-theory"),
    proof: { zh: "籌備中", en: "In preparation" },
  },
];

export const books = [
  {
    title: { zh: "地球升級指南", en: "Guide to Upgrading Earth" },
    subtitle: { zh: "行星外科手術與地質工程的未來", en: "Planetary Surgery and the Future of Geoengineering" },
    phase: { zh: "重構中", en: "In revision" },
    image: "/media/books/earth-guide.jpg",
  },
  {
    title: { zh: "AI 教我的事", en: "What AI Taught Me" },
    subtitle: { zh: "宇宙最努力的智慧體給人類的啟示", en: "Lessons from the Universe's Most Persistent Learner" },
    phase: { zh: "版本演化中", en: "Evolving edition" },
    image: "/media/books/ai-taught-me.png",
  },
  {
    title: { zh: "瞬間的平等", en: "Equality of the Instant" },
    subtitle: { zh: "為什麼我們本質相同，卻活得如此不同", en: "Why Similar Beings Live So Differently" },
    phase: { zh: "版本演化中", en: "Evolving edition" },
    image: "/media/books/equality.jpg",
  },
  {
    title: { zh: "情緒清醒術", en: "Emotional Clarity" },
    subtitle: { zh: "從焦慮到行動的決策方法", en: "A Decision Method from Anxiety to Action" },
    phase: { zh: "重構中", en: "In revision" },
    image: "/media/books/emotional-clarity.png",
  },
  {
    title: { zh: "語言的秘密", en: "The Secrets of Language" },
    subtitle: { zh: "語言選擇背後的認知訊號", en: "Cognitive Signals Behind Language Choice" },
    phase: { zh: "國際版重構中", en: "International edition in revision" },
    image: "/media/books/language.png",
  },
  {
    title: { zh: "無界策", en: "Strategy Without Boundaries" },
    subtitle: { zh: "從創世到歸零的策略架構", en: "A Strategic Architecture from Genesis to Zero" },
    phase: { zh: "翻譯與重構中", en: "Translation and revision" },
    image: "/media/books/wujiece.png",
  },
];

export const phaseLabels = {
  concept: { zh: "概念", en: "Concept" },
  prototype: { zh: "原型", en: "Prototype" },
  evolving: { zh: "演化中", en: "Evolving" },
  "semi-stable": { zh: "半穩定", en: "Semi-stable" },
  archived: { zh: "封存", en: "Archived" },
} satisfies Record<LifeCycle, LocalizedText>;
