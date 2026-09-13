import { notFound } from "next/navigation";
import { getNewsBySlug } from "@/lib/store";
import ArticleView from "./ArticleView";

export const dynamic = "force-dynamic";

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);
  if (!article) notFound();

  return <ArticleView article={article} />;
}
