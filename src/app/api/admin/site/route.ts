import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { readSite, updateSite } from "@/lib/store";

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const site = await readSite();
  return NextResponse.json(site);
}

// Body: { fields?: Record<key,{ar,en}>, plain?: Record<key,string>, arrays?: Record<name,unknown[]> }
// Each provided key is merged into the existing store — omitted keys are left untouched.
export async function PUT(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const site = await updateSite((current) => {
    if (body.fields) {
      for (const [key, value] of Object.entries(body.fields as Record<string, { ar: string; en: string }>)) {
        if (!current.fields[key]) continue;
        current.fields[key] = { ...current.fields[key], ar: value.ar, en: value.en };
      }
    }
    if (body.plain) {
      for (const [key, value] of Object.entries(body.plain as Record<string, string>)) {
        current.plain[key] = value;
      }
    }
    if (body.arrays) {
      for (const [key, value] of Object.entries(body.arrays as Record<string, unknown[]>)) {
        current.arrays[key] = value;
      }
    }
    return current;
  });

  return NextResponse.json(site);
}
