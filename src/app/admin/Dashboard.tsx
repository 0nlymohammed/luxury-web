"use client";

import { useMemo, useState } from "react";
import type { SiteContent, NewsArticle } from "@/lib/store";
import { TABS } from "./tabs";
import { ICON_KEYS, FIELD_LABELS, KEY_ORDER } from "./icons";
import NewsEditor from "./NewsEditor";

type ArrayItem = Record<string, unknown>;

const INPUT =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-[#0b1836] placeholder:text-slate-400 outline-none transition-colors focus:border-[#2365fa] focus:ring-2 focus:ring-[#2365fa]/20";
const LABEL = "text-sm font-medium text-[#0b1836]";

function cloneSite(site: SiteContent): SiteContent {
  return JSON.parse(JSON.stringify(site));
}

function fieldKeysForSection(site: SiteContent, section: string): string[] {
  return Object.keys(site.fields)
    .filter((k) => site.fields[k].section === section)
    .sort((a, b) => {
      const na = Number(a.split(".").pop());
      const nb = Number(b.split(".").pop());
      return na - nb;
    });
}

function ItemFieldInput({
  itemKey,
  value,
  onChange,
}: {
  itemKey: string;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const label = FIELD_LABELS[itemKey] || itemKey;

  if (itemKey === "ic") {
    return (
      <label className={`flex flex-col gap-1.5 ${LABEL}`}>
        <span>{label}</span>
        <select
          className={INPUT}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        >
          {ICON_KEYS.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </label>
    );
  }

  // proc-style {ar:[title,desc], en:[title,desc]}
  if ((itemKey === "ar" || itemKey === "en") && Array.isArray(value)) {
    const arr = value as string[];
    const dir = itemKey === "ar" ? "rtl" : "ltr";
    return (
      <div className={`flex flex-col gap-1.5 ${LABEL}`}>
        <span>{itemKey === "ar" ? "Arabic" : "English"}</span>
        <input
          dir={dir}
          className={INPUT}
          placeholder="Title"
          value={arr[0] ?? ""}
          onChange={(e) => onChange([e.target.value, arr[1] ?? ""])}
        />
        <input
          dir={dir}
          className={INPUT}
          placeholder="Description"
          value={arr[1] ?? ""}
          onChange={(e) => onChange([arr[0] ?? "", e.target.value])}
        />
      </div>
    );
  }

  // list fields: ia / ie
  if (Array.isArray(value)) {
    const arr = value as string[];
    const dir = itemKey === "ia" ? "rtl" : "ltr";
    return (
      <label className={`flex flex-col gap-1.5 ${LABEL}`}>
        <span>{label}</span>
        <textarea
          dir={dir}
          rows={4}
          className={INPUT}
          value={arr.join("\n")}
          onChange={(e) => onChange(e.target.value.split("\n"))}
        />
      </label>
    );
  }

  const dir = itemKey === "ar" || itemKey === "dAr" ? "rtl" : "ltr";
  const long = itemKey === "dAr" || itemKey === "dEn" || itemKey === "ar" || itemKey === "en";

  return (
    <label className={`flex flex-col gap-1.5 ${LABEL}`}>
      <span>{label}</span>
      {long ? (
        <textarea
          dir={dir}
          rows={2}
          className={INPUT}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          dir={dir}
          className={INPUT}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}

function ArrayEditor({
  items,
  onChange,
}: {
  items: ArrayItem[];
  onChange: (items: ArrayItem[]) => void;
}) {
  function updateItem(idx: number, key: string, value: unknown) {
    const next = items.map((it, i) => (i === idx ? { ...it, [key]: value } : it));
    onChange(next);
  }

  function move(idx: number, dir: -1 | 1) {
    const target = idx + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  }

  function remove(idx: number) {
    if (!confirm("Remove this item?")) return;
    onChange(items.filter((_, i) => i !== idx));
  }

  function add() {
    const template = items[0] || { ic: "code", ar: "", en: "" };
    const blank: ArrayItem = {};
    for (const k of Object.keys(template)) {
      blank[k] = Array.isArray(template[k]) ? (typeof (template[k] as unknown[])[0] === "string" && k !== "ar" && k !== "en" ? [] : ["", ""]) : "";
    }
    onChange([...items, blank]);
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((item, idx) => {
        const keys = Object.keys(item).sort(
          (a, b) => (KEY_ORDER.indexOf(a) === -1 ? 99 : KEY_ORDER.indexOf(a)) - (KEY_ORDER.indexOf(b) === -1 ? 99 : KEY_ORDER.indexOf(b))
        );
        return (
          <div key={idx} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#71809f]">
                Item {idx + 1}
              </span>
              <div className="flex gap-2">
                <button type="button" onClick={() => move(idx, -1)} className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-[#0b1836] hover:bg-slate-50">↑</button>
                <button type="button" onClick={() => move(idx, 1)} className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-[#0b1836] hover:bg-slate-50">↓</button>
                <button type="button" onClick={() => remove(idx)} className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50">Remove</button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {keys.map((k) => (
                <div key={k} className={k === "ia" || k === "ie" || k === "dAr" || k === "dEn" ? "sm:col-span-2" : ""}>
                  <ItemFieldInput itemKey={k} value={item[k]} onChange={(v) => updateItem(idx, k, v)} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
      <button
        type="button"
        onClick={add}
        className="self-start rounded-lg border border-dashed border-slate-300 px-4 py-2.5 text-sm font-semibold text-[#48577a] transition-colors hover:border-[#2365fa] hover:text-[#2365fa]"
      >
        + Add item
      </button>
    </div>
  );
}

export default function Dashboard({
  initialSite,
  initialNews,
}: {
  initialSite: SiteContent;
  initialNews: NewsArticle[];
}) {
  const [site, setSite] = useState<SiteContent>(() => cloneSite(initialSite));
  const [activeTab, setActiveTab] = useState(TABS[0].key);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const tab = useMemo(() => TABS.find((t) => t.key === activeTab), [activeTab]);

  function updateField(key: string, lang: "ar" | "en", value: string) {
    setSite((s) => ({
      ...s,
      fields: { ...s.fields, [key]: { ...s.fields[key], [lang]: value } },
    }));
  }

  function updatePlain(key: string, value: string) {
    setSite((s) => ({ ...s, plain: { ...s.plain, [key]: value } }));
  }

  function updateArray(arrayKey: string, items: ArrayItem[]) {
    setSite((s) => ({ ...s, arrays: { ...s.arrays, [arrayKey]: items } }));
  }

  async function save() {
    if (!tab) return;
    setSaving(true);
    setMessage(null);
    try {
      const body: Record<string, unknown> = {};
      if (tab.section) {
        const keys = fieldKeysForSection(site, tab.section);
        body.fields = Object.fromEntries(keys.map((k) => [k, site.fields[k]]));
      }
      if (tab.arrayKey) {
        body.arrays = { [tab.arrayKey]: site.arrays[tab.arrayKey] };
      }
      if (tab.plainKeys) {
        body.plain = Object.fromEntries(tab.plainKeys.map((p) => [p.key, site.plain[p.key]]));
      }

      const res = await fetch("/api/admin/site", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Save failed");
      setMessage("Saved — live on the site now.");
    } catch {
      setMessage("Something went wrong while saving. Please try again.");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 4000);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin";
  }

  const fieldKeys = tab?.section ? fieldKeysForSection(site, tab.section) : [];

  return (
    <div className="flex min-h-screen bg-[#f4f7fc]">
      <aside className="flex w-64 shrink-0 flex-col bg-[#020e30] p-4">
        <div className="mb-8 flex items-center gap-1 px-2 pt-2 font-extrabold tracking-tight">
          <span className="text-lg text-white">LU</span>
          <span className="text-lg text-[#31b1fb]">X</span>
          <span className="text-lg text-white">URY</span>
          <span className="ms-1 text-xs font-semibold uppercase tracking-wider text-[#7688b0]">Admin</span>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`rounded-lg px-3 py-2 text-start text-sm font-medium transition-colors ${
                t.key === activeTab
                  ? "bg-[#2365fa] text-white shadow-[0_6px_16px_-6px_rgba(35,101,250,0.7)]"
                  : "text-[#b7c2e0] hover:bg-white/5 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
          <button
            key="news-articles"
            onClick={() => setActiveTab("news-articles")}
            className={`mt-3 rounded-lg border-t border-white/10 px-3 py-2 pt-4 text-start text-sm font-medium transition-colors ${
              activeTab === "news-articles"
                ? "bg-[#2365fa] text-white shadow-[0_6px_16px_-6px_rgba(35,101,250,0.7)]"
                : "text-[#b7c2e0] hover:bg-white/5 hover:text-white"
            }`}
          >
            News Articles
          </button>
        </nav>
        <button
          onClick={logout}
          className="mt-4 w-full rounded-lg border border-white/15 px-3 py-2 text-sm font-medium text-[#b7c2e0] transition-colors hover:bg-white/5 hover:text-white"
        >
          Log out
        </button>
      </aside>

      <main className="flex-1 p-8">
        {!tab ? (
          <NewsEditor initialNews={initialNews} />
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-[#0b1836]">{tab.label}</h1>
              <div className="flex items-center gap-3">
                {message && <span className="text-sm text-[#48577a]">{message}</span>}
                <button
                  onClick={save}
                  disabled={saving}
                  className="rounded-lg bg-[#2365fa] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(35,101,250,0.7)] transition-colors hover:bg-[#1a4fd4] disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              {fieldKeys.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="mb-5 text-xs font-bold uppercase tracking-wider text-[#71809f]">
                    Text content
                  </h2>
                  <div className="flex flex-col gap-5">
                    {fieldKeys.map((key) => (
                      <div key={key} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <label className={`flex flex-col gap-1.5 ${LABEL}`}>
                          <span>Arabic</span>
                          <textarea
                            dir="rtl"
                            rows={site.fields[key].ar.length > 60 ? 3 : 1}
                            className={INPUT}
                            value={site.fields[key].ar}
                            onChange={(e) => updateField(key, "ar", e.target.value)}
                          />
                        </label>
                        <label className={`flex flex-col gap-1.5 ${LABEL}`}>
                          <span>English</span>
                          <textarea
                            dir="ltr"
                            rows={site.fields[key].en.length > 60 ? 3 : 1}
                            className={INPUT}
                            value={site.fields[key].en}
                            onChange={(e) => updateField(key, "en", e.target.value)}
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab.plainKeys && (
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="mb-5 text-xs font-bold uppercase tracking-wider text-[#71809f]">
                    Contact details
                  </h2>
                  <div className="flex flex-col gap-4">
                    {tab.plainKeys.map((p) => (
                      <label key={p.key} className={`flex flex-col gap-1.5 ${LABEL}`}>
                        <span>{p.label}</span>
                        <input
                          dir="ltr"
                          className={INPUT}
                          value={site.plain[p.key] ?? ""}
                          onChange={(e) => updatePlain(p.key, e.target.value)}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {tab.arrayKey && (
                <div>
                  <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#71809f]">
                    Repeating items
                  </h2>
                  <ArrayEditor
                    items={(site.arrays[tab.arrayKey] as ArrayItem[]) || []}
                    onChange={(items) => updateArray(tab.arrayKey!, items)}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
