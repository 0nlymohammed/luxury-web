import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { createNews, readNews } from "@/lib/store";

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const news = await readNews();
  return NextResponse.json(news);
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body?.titleAr || !body?.titleEn) {
    return NextResponse.json({ error: "Title (AR & EN) is required" }, { status: 400 });
  }

  const article = await createNews({
    titleAr: body.titleAr,
    titleEn: body.titleEn,
    bodyAr: body.bodyAr || "",
    bodyEn: body.bodyEn || "",
    date: body.date || new Date().toISOString().slice(0, 10),
    cover: body.cover || "",
    published: Boolean(body.published),
  });

  return NextResponse.json(article, { status: 201 });
}
