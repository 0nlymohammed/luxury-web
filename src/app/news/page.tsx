import { readNews } from "@/lib/store";
import NewsListView from "./NewsListView";

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const news = await readNews();
  const published = news
    .filter((n) => n.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return <NewsListView articles={published} />;
}
