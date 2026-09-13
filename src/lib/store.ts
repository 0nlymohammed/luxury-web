import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

export type Bilingual = { ar: string; en: string };

export type SiteContent = {
  fields: Record<string, Bilingual & { section: string }>;
  plain: Record<string, string>;
  arrays: Record<string, unknown[]>;
  updatedAt: string;
};

export type NewsArticle = {
  id: string;
  slug: string;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  date: string; // ISO date
  cover: string; // /uploads/xxx or ""
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const SITE_FILE = path.join(DATA_DIR, "site.json");
const SITE_SEED_FILE = path.join(DATA_DIR, "site.seed.json");
const NEWS_FILE = path.join(DATA_DIR, "news.json");

let siteQueue: Promise<unknown> = Promise.resolve();
let newsQueue: Promise<unknown> = Promise.resolve();

async function ensureFile(file: string, fallback: string) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(file);
  } catch {
    await fs.writeFile(file, fallback, "utf8");
  }
}

async function atomicWrite(file: string, contents: string) {
  const tmp = `${file}.tmp`;
  await fs.writeFile(tmp, contents, "utf8");
  await fs.rename(tmp, file);
}

export async function readSite(): Promise<SiteContent> {
  try {
    await fs.access(SITE_FILE);
  } catch {
    // First run on this machine: seed the live (gitignored) file from the
    // tracked seed so a fresh `git pull` deploy never overwrites live edits.
    await fs.mkdir(DATA_DIR, { recursive: true });
    const seed = await fs.readFile(SITE_SEED_FILE, "utf8").catch(
      () => JSON.stringify({ fields: {}, plain: {}, arrays: {}, updatedAt: new Date().toISOString() })
    );
    await fs.writeFile(SITE_FILE, seed, "utf8");
  }
  const raw = await fs.readFile(SITE_FILE, "utf8");
  return JSON.parse(raw);
}

export async function updateSite(mutate: (site: SiteContent) => SiteContent | void): Promise<SiteContent> {
  const task = siteQueue.then(async () => {
    const site = await readSite();
    const next = mutate(site) || site;
    next.updatedAt = new Date().toISOString();
    await atomicWrite(SITE_FILE, JSON.stringify(next, null, 2));
    return next;
  });
  siteQueue = task.catch(() => {});
  return task;
}

export async function readNews(): Promise<NewsArticle[]> {
  await ensureFile(NEWS_FILE, "[]");
  const raw = await fs.readFile(NEWS_FILE, "utf8");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeNewsList(list: NewsArticle[]) {
  await atomicWrite(NEWS_FILE, JSON.stringify(list, null, 2));
}

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return base || crypto.randomUUID().slice(0, 8);
}

export async function createNews(input: {
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  date: string;
  cover: string;
  published: boolean;
}): Promise<NewsArticle> {
  const task = newsQueue.then(async () => {
    const list = await readNews();
    const now = new Date().toISOString();
    let slug = slugify(input.titleEn || input.titleAr);
    let n = 1;
    while (list.some((a) => a.slug === slug)) {
      n += 1;
      slug = `${slugify(input.titleEn || input.titleAr)}-${n}`;
    }
    const article: NewsArticle = {
      id: crypto.randomUUID(),
      slug,
      ...input,
      createdAt: now,
      updatedAt: now,
    };
    list.unshift(article);
    await writeNewsList(list);
    return article;
  });
  newsQueue = task.catch(() => {}) as Promise<unknown>;
  return task;
}

export async function updateNews(id: string, patch: Partial<Omit<NewsArticle, "id" | "createdAt">>): Promise<NewsArticle | null> {
  const task = newsQueue.then(async () => {
    const list = await readNews();
    const idx = list.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    const updated: NewsArticle = { ...list[idx], ...patch, updatedAt: new Date().toISOString() };
    if (patch.titleEn || patch.titleAr) {
      const desired = slugify(patch.titleEn || patch.titleAr || updated.titleEn || updated.titleAr);
      if (desired !== list[idx].slug && !list.some((a, i) => i !== idx && a.slug === desired)) {
        updated.slug = desired;
      }
    }
    list[idx] = updated;
    await writeNewsList(list);
    return updated;
  });
  newsQueue = task.catch(() => {}) as Promise<unknown>;
  return task;
}

export async function deleteNews(id: string): Promise<boolean> {
  const task = newsQueue.then(async () => {
    const list = await readNews();
    const next = list.filter((a) => a.id !== id);
    const changed = next.length !== list.length;
    if (changed) await writeNewsList(next);
    return changed;
  });
  newsQueue = task.catch(() => {}) as Promise<unknown>;
  return task;
}

export async function getNewsBySlug(slug: string): Promise<NewsArticle | null> {
  const list = await readNews();
  return list.find((a) => a.slug === slug && a.published) || null;
}
