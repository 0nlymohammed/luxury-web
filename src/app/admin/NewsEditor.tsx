"use client";

import { useState } from "react";
import type { NewsArticle } from "@/lib/store";

const INPUT =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-[#0b1836] placeholder:text-slate-400 outline-none transition-colors focus:border-[#2365fa] focus:ring-2 focus:ring-[#2365fa]/20";
const LABEL = "text-sm font-medium text-[#0b1836]";

type Draft = {
  id?: string;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  date: string;
  cover: string;
  published: boolean;
};

const EMPTY: Draft = {
  titleAr: "",
  titleEn: "",
  bodyAr: "",
  bodyEn: "",
  date: new Date().toISOString().slice(0, 10),
  cover: "",
  published: false,
};

export default function NewsEditor({ initialNews }: { initialNews: NewsArticle[] }) {
  const [news, setNews] = useState<NewsArticle[]>(initialNews);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  function startNew() {
    setDraft({ ...EMPTY });
  }

  function startEdit(article: NewsArticle) {
    setDraft({
      id: article.id,
      titleAr: article.titleAr,
      titleEn: article.titleEn,
      bodyAr: article.bodyAr,
      bodyEn: article.bodyEn,
      date: article.date,
      cover: article.cover,
      published: article.published,
    });
  }

  async function uploadCover(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setDraft((d) => (d ? { ...d, cover: data.url } : d));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function saveDraft() {
    if (!draft) return;
    if (!draft.titleAr.trim() || !draft.titleEn.trim()) {
      alert("Title (Arabic and English) is required.");
      return;
    }
    setSaving(true);
    try {
      const isNew = !draft.id;
      const res = await fetch(isNew ? "/api/admin/news" : `/api/admin/news/${draft.id}`, {
        method: isNew ? "POST" : "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      if (isNew) {
        setNews((n) => [data, ...n]);
      } else {
        setNews((n) => n.map((a) => (a.id === data.id ? data : a)));
      }
      setDraft(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this article? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/news/${id}`, { method: "DELETE" });
    if (res.ok) setNews((n) => n.filter((a) => a.id !== id));
  }

  async function togglePublished(article: NewsArticle) {
    const res = await fetch(`/api/admin/news/${article.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ published: !article.published }),
    });
    const data = await res.json();
    if (res.ok) setNews((n) => n.map((a) => (a.id === data.id ? data : a)));
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0b1836]">News Articles</h1>
        {!draft && (
          <button
            onClick={startNew}
            className="rounded-lg bg-[#2365fa] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(35,101,250,0.7)] transition-colors hover:bg-[#1a4fd4]"
          >
            + New article
          </button>
        )}
      </div>

      {draft ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xs font-bold uppercase tracking-wider text-[#71809f]">
            {draft.id ? "Edit article" : "New article"}
          </h2>
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className={`flex flex-col gap-1.5 ${LABEL}`}>
                <span>Title (Arabic)</span>
                <input
                  dir="rtl"
                  className={INPUT}
                  value={draft.titleAr}
                  onChange={(e) => setDraft({ ...draft, titleAr: e.target.value })}
                />
              </label>
              <label className={`flex flex-col gap-1.5 ${LABEL}`}>
                <span>Title (English)</span>
                <input
                  className={INPUT}
                  value={draft.titleEn}
                  onChange={(e) => setDraft({ ...draft, titleEn: e.target.value })}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className={`flex flex-col gap-1.5 ${LABEL}`}>
                <span>Body (Arabic)</span>
                <textarea
                  dir="rtl"
                  rows={8}
                  className={INPUT}
                  value={draft.bodyAr}
                  onChange={(e) => setDraft({ ...draft, bodyAr: e.target.value })}
                />
              </label>
              <label className={`flex flex-col gap-1.5 ${LABEL}`}>
                <span>Body (English)</span>
                <textarea
                  rows={8}
                  className={INPUT}
                  value={draft.bodyEn}
                  onChange={(e) => setDraft({ ...draft, bodyEn: e.target.value })}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className={`flex flex-col gap-1.5 ${LABEL}`}>
                <span>Date</span>
                <input
                  type="date"
                  className={INPUT}
                  value={draft.date}
                  onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                />
              </label>
              <div className={`flex flex-col gap-1.5 ${LABEL}`}>
                <span>Cover image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && uploadCover(e.target.files[0])}
                  className="text-sm text-[#48577a] file:me-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-[#0b1836] hover:file:bg-slate-200"
                />
                {uploading && <span className="text-xs text-[#71809f]">Uploading…</span>}
                {draft.cover && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={draft.cover} alt="" className="mt-2 h-32 w-full rounded-lg object-cover" />
                )}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={draft.published}
                onChange={(e) => setDraft({ ...draft, published: e.target.checked })}
                className="size-4 rounded border-slate-300 text-[#2365fa] focus:ring-[#2365fa]/30"
              />
              <span className="font-medium text-[#0b1836]">Published (visible on the site)</span>
            </label>

            <div className="flex gap-3">
              <button
                onClick={saveDraft}
                disabled={saving}
                className="rounded-lg bg-[#2365fa] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(35,101,250,0.7)] transition-colors hover:bg-[#1a4fd4] disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save article"}
              </button>
              <button
                onClick={() => setDraft(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-[#0b1836] hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {news.length === 0 && (
            <p className="text-sm text-[#71809f]">No articles yet. Create your first one.</p>
          )}
          {news.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-4">
                {a.cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.cover} alt="" className="h-14 w-20 rounded-lg object-cover" />
                ) : (
                  <div className="h-14 w-20 rounded-lg bg-slate-100" />
                )}
                <div>
                  <div className="font-semibold text-[#0b1836]">{a.titleEn}</div>
                  <div className="text-sm text-[#48577a]" dir="rtl">{a.titleAr}</div>
                  <div className="mt-1 text-xs text-[#71809f]">{a.date}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    a.published ? "bg-green-100 text-green-700" : "bg-slate-100 text-[#48577a]"
                  }`}
                >
                  {a.published ? "Published" : "Draft"}
                </span>
                <button
                  onClick={() => togglePublished(a)}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-[#0b1836] hover:bg-slate-50"
                >
                  {a.published ? "Unpublish" : "Publish"}
                </button>
                <button
                  onClick={() => startEdit(a)}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-[#0b1836] hover:bg-slate-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => remove(a.id)}
                  className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
