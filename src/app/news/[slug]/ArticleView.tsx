"use client";

import type { NewsArticle } from "@/lib/store";
import { useLang, fmtDate } from "../lang-context";

export default function ArticleView({ article }: { article: NewsArticle }) {
  const { lang } = useLang();
  const title = lang === "ar" ? article.titleAr : article.titleEn;
  const body = lang === "ar" ? article.bodyAr : article.bodyEn;
  const paragraphs = body.split(/\n+/).filter(Boolean);

  return (
    <article style={{ maxWidth: 860, marginInline: "auto" }}>
      {article.cover && (
        <div className="article-hero">
          <img src={article.cover} alt="" />
        </div>
      )}
      <span className="article-date">{fmtDate(article.date, lang)}</span>
      <h1 className="article-title">{title}</h1>
      <div className="article-body">
        {paragraphs.length > 0 ? (
          paragraphs.map((p, i) => <p key={i}>{p}</p>)
        ) : (
          <p>{lang === "ar" ? "لا يوجد محتوى بعد." : "No content yet."}</p>
        )}
      </div>
    </article>
  );
}
