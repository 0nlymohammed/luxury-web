// Post-processes ./out into something GitHub Pages serves correctly.
import { promises as fs } from "fs";
import path from "path";

const out = path.join(process.cwd(), "out");
const at = (p) => path.join(out, p);

// The site is a GET route handler, so Next exports it as an extensionless
// "index" file. Pages only treats "index.html" as a directory index.
try {
  await fs.rename(at("index"), at("index.html"));
} catch (err) {
  if (err.code !== "ENOENT") throw err;
}

// Serve /news/ as well as /news.
try {
  await fs.mkdir(at("news"), { recursive: true });
  await fs.copyFile(at("news.html"), at("news/index.html"));
} catch (err) {
  if (err.code !== "ENOENT") throw err;
}

// Without this, Pages runs Jekyll, which refuses to serve the _next directory.
await fs.writeFile(at(".nojekyll"), "", "utf8");

const domain = process.env.SITE_DOMAIN;
if (domain) await fs.writeFile(at("CNAME"), domain + "\n", "utf8");

console.log("out/ ready" + (domain ? ` for ${domain}` : ""));
