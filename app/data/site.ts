export const SITE_URL = "https://thisoneisneok.com";

export function canonical(path = "/") {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

export type LocalizedText = {
  zh: string;
  en: string;
};

export type Language = "zh" | "en";

export function text(value: LocalizedText, language: Language) {
  return value[language] || value.zh;
}
