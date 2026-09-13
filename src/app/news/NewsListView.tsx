"use client";

import Link from "next/link";
import type { NewsArticle } from "@/lib/store";
import { useLang, fmtDate } from "./lang-context";

export default function NewsListView({ articles }: { articles: NewsArticle[] }) {
  const { lang } = useLang();

  return (
    <>
      <div className="center" style={{ marginBottom: "clamp(30px,4vw,46px)" }}>
        <span className="eyebrow lat">{lang === "ar" ? "آخر الأخبار" : "Latest News"}</span>
        <h1 className="head">{lang === "ar" ? "جديدنا وتحديثاتنا" : "Our latest news and updates"}</h1>
      </div>

      {articles.length === 0 ? (
        <p className="news-empty">
          {lang === "ar" ? "لا توجد أخبار منشورة بعد." : "No published articles yet."}
        </p>
      ) : (
        <div className="news">
          {articles.map((a) => {
            const title = lang === "ar" ? a.titleAr : a.titleEn;
            const body = lang === "ar" ? a.bodyAr : a.bodyEn;
            const excerpt = body.replace(/\s+/g, " ").trim().slice(0, 140);
            return (
              <Link key={a.id} href={`/news/${a.slug}`} className="ncard">
                {a.cover && <img className="cov" src={a.cover} alt="" loading="lazy" />}
                <div className="nbody">
                  <span className="ndate">{fmtDate(a.date, lang)}</span>
                  <h3>{title}</h3>
                  <p>{excerpt}{excerpt.length >= 140 ? "…" : ""}</p>
                  <span className="nmore">{lang === "ar" ? "اقرأ المزيد" : "Read more"} →</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
