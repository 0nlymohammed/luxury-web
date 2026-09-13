import { load } from "cheerio";
import { promises as fs } from "fs";
import path from "path";
import type { SiteContent, NewsArticle } from "./store";

const TEMPLATE_PATH = path.join(process.cwd(), "templates", "site.template.html");

let cachedTemplate: string | null = null;
async function loadTemplate(): Promise<string> {
  if (cachedTemplate && process.env.NODE_ENV === "production") return cachedTemplate;
  cachedTemplate = await fs.readFile(TEMPLATE_PATH, "utf8");
  return cachedTemplate;
}

export async function renderSiteHtml(site: SiteContent, news: NewsArticle[]): Promise<string> {
  const template = await loadTemplate();
  const $ = load(template);

  for (const [key, value] of Object.entries(site.fields)) {
    const el = $(`[data-key="${key}"]`);
    if (!el.length) continue;
    el.attr("data-ar", value.ar);
    el.attr("data-en", value.en);
    el.text(value.ar);
  }

  for (const [key, value] of Object.entries(site.plain)) {
    const el = $(`[data-plain-key="${key}"]`);
    if (!el.length) continue;
    el.text(value);
  }

  const payload = {
    fields: site.fields,
    arrays: site.arrays,
    news: news.filter((n) => n.published),
  };

  $("head").append(
    `<script>window.__SITE__=${JSON.stringify(payload).replace(/</g, "\\u003c")};</script>`
  );

  return $.html();
}
