import { readSite, readNews } from "@/lib/store";
import { renderSiteHtml } from "@/lib/render-site";

export const dynamic = "force-dynamic";

export async function GET() {
  const [site, news] = await Promise.all([readSite(), readNews()]);
  const html = "<!doctype html>" + (await renderSiteHtml(site, news));
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
