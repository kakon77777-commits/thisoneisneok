"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Language, LocalizedText } from "../data/site";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (value: LocalizedText) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("zh");

  useEffect(() => {
    const saved = window.localStorage.getItem("neok-language");
    const detected = navigator.language.toLowerCase().startsWith("zh")
      ? "zh"
      : "en";
    const next = saved === "zh" || saved === "en" ? saved : detected;
    const frame = window.requestAnimationFrame(() => setLanguageState(next));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-Hant" : "en";
  }, [language]);

  const setLanguage = (next: Language) => {
    setLanguageState(next);
    window.localStorage.setItem("neok-language", next);
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (copy: LocalizedText) => copy[language] || copy.zh,
    }),
    [language],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
