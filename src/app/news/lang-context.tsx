"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Lang = "ar" | "en";
const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "ar",
  setLang: () => {},
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("luxury-news-lang");
      if (stored === "ar" || stored === "en") setLangState(stored);
    } catch {}
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    try {
      localStorage.setItem("luxury-news-lang", l);
    } catch {}
  }

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

export function fmtDate(iso: string, lang: Lang): string {
  try {
    return new Date(iso).toLocaleDateString(lang === "ar" ? "ar-EG-u-nu-latn" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}
