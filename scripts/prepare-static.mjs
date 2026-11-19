// Turns the Next app into a statically exportable site for GitHub Pages.
//
// The admin CMS writes JSON and uploaded images to disk at runtime, which no
// static host can do, so this drops /admin and its API routes from the export
// build only. The committed source keeps them for local `npm run dev` editing.
import { promises as fs } from "fs";
import path from "path";

// This rewrites and deletes files in place, so it is meant for a throwaway CI
// checkout. Running it in a working tree would drop the admin CMS from it.
if (!process.env.CI && !process.argv.includes("--force")) {
  console.error(
    "refusing to run outside CI: this deletes src/app/admin and src/app/api",
    "from the working tree. Pass --force if that is really what you want.",
  );
  process.exit(1);
}

const root = process.cwd();
const at = (p) => path.join(root, p);

await fs.rm(at("src/app/api"), { recursive: true, force: true });
await fs.rm(at("src/app/admin"), { recursive: true, force: true });

// The live content files are gitignored, so seed them on a fresh checkout.
await fs.mkdir(at("data"), { recursive: true });
try {
  await fs.access(at("data/site.json"));
} catch {
  await fs.copyFile(at("data/site.seed.json"), at("data/site.json"));
}
try {
  await fs.access(at("data/news.json"));
} catch {
  await fs.writeFile(at("data/news.json"), "[]", "utf8");
}

// force-dynamic cannot coexist with output: "export"; the export build wants
// these rendered once at build time instead of per request.
for (const file of [
  "src/app/route.ts",
  "src/app/news/page.tsx",
  "src/app/news/[slug]/page.tsx",
]) {
  const p = at(file);
  const src = await fs.readFile(p, "utf8");
  await fs.writeFile(p, src.replace('"force-dynamic"', '"force-static"'), "utf8");
}

// A static export needs every article slug up front, and Next refuses to
// export a dynamic segment that generates no routes at all - so with no
// published articles the route is dropped instead. Publishing one and
// pushing brings it back on the next build.
const published = JSON.parse(await fs.readFile(at("data/news.json"), "utf8"))
  .filter((n) => n.published);

if (published.length === 0) {
  await fs.rm(at("src/app/news/[slug]"), { recursive: true, force: true });
  console.log("prepared for static export (no published articles)");
  process.exit(0);
}

const slugPage = at("src/app/news/[slug]/page.tsx");
await fs.writeFile(
  slugPage,
  (await fs.readFile(slugPage, "utf8")) +
    `
export const dynamicParams = false;

export async function generateStaticParams() {
  const { readNews } = await import("@/lib/store");
  const news = await readNews();
  return news.filter((n) => n.published).map((n) => ({ slug: n.slug }));
}
`,
  "utf8",
);

console.log("prepared for static export");
