"use client";

import Link from "next/link";
import { LangProvider, useLang } from "./lang-context";

function HeaderInner() {
  const { lang, setLang } = useLang();
  return (
    <header className="nshell-header">
      <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
        <Link href="/" className="nshell-brand">LU<i>X</i>URY</Link>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <Link href="/" className="nshell-back">
            {lang === "ar" ? "الرئيسية" : "Home"}
          </Link>
          <div className="nshell-lang">
            <button type="button" className={lang === "ar" ? "on" : ""} onClick={() => setLang("ar")}>ع</button>
            <button type="button" className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>EN</button>
          </div>
        </div>
      </div>
    </header>
  );
}

function FooterInner() {
  const { lang } = useLang();
  return (
    <footer className="nshell-footer">
      <span>© 2026 LUXURY — {lang === "ar" ? "جميع الحقوق محفوظة" : "All rights reserved"}</span>
    </footer>
  );
}

function ShellInner({ children }: { children: React.ReactNode }) {
  const { lang } = useLang();
  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} lang={lang} style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <HeaderInner />
      <main className="nshell-main wrap" style={{ flex: 1, width: "100%" }}>
        {children}
      </main>
      <FooterInner />
    </div>
  );
}

export default function NewsShell({ children }: { children: React.ReactNode }) {
  return (
    <LangProvider>
      <ShellInner>{children}</ShellInner>
    </LangProvider>
  );
}
