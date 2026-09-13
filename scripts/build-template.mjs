// One-time extraction: reads the original static LUXURY template, tags every
// bilingual text element with a stable data-key, and writes:
//   templates/site.template.html   (server-rendered template, checked in)
//   data/site.json                 (seed content store, editable via admin)
import { load } from 'cheerio';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const src = readFileSync(path.join(root, 'templates/source.html'), 'utf8');

const $ = load(src, { decodeEntities: false });

const SECTION_IDS = [
  'nav', 'top', 'about', 'services', 'security', 'ai', 'work', 'why',
  'sectors', 'process', 'contact',
];

function sectionOf(el) {
  let node = el;
  while (node) {
    const id = $(node).attr && $(node).attr('id');
    if (id && SECTION_IDS.includes(id)) return id === 'top' ? 'hero' : id;
    if (node.tagName === 'footer') return 'footer';
    if (node.tagName === 'nav') return 'nav';
    node = node.parent;
  }
  return 'global';
}

const fields = {};
const counters = {};

$('[data-ar]').each((_, el) => {
  const $el = $(el);
  const ar = $el.attr('data-ar');
  const en = $el.attr('data-en') ?? '';
  const section = sectionOf(el);
  counters[section] = (counters[section] || 0) + 1;
  const key = `${section}.${counters[section]}`;
  $el.attr('data-key', key);
  fields[key] = { ar, en, section };
});

// Plain (single-language / latin-only) text nodes not covered by data-ar.
const plain = {};

// Contact section email
const contactEmail = $('#contact .ci .lat').first();
contactEmail.attr('data-plain-key', 'contact.email');
plain['contact.email'] = contactEmail.text().trim();

// Footer email
const footerEmail = $('footer .li.lat').first();
footerEmail.attr('data-plain-key', 'footer.email');
plain['footer.email'] = footerEmail.text().trim();

// Footer tagline (latin)
const footerTagline = $('footer .foot-b .lat').first();
footerTagline.attr('data-plain-key', 'footer.tagline');
plain['footer.tagline'] = footerTagline.text().trim();

// Footer copyright prefix ("© 2026 LUXURY") — wrap the leading text node
const copyrightSpan = $('footer .foot-b span').first();
{
  const html = copyrightSpan.html();
  const idx = html.indexOf('<span');
  const prefix = html.slice(0, idx).trim();
  plain['footer.copyrightPrefix'] = prefix;
  copyrightSpan.html(
    `<span data-plain-key="footer.copyrightPrefix">${prefix}</span>` + html.slice(idx)
  );
}

// Extract JS data arrays out of the inline <script> and rewire it to read
// them from window.__SITE__ at runtime instead of hardcoding them.
let scriptText = $('script').first().html();

const ARRAY_NAMES = ['SERVICES', 'SEC', 'AI', 'WORK', 'WHY', 'SECTORS', 'PROC', 'ABOUT'];
const arrays = {};

for (const name of ARRAY_NAMES) {
  const re = new RegExp(`const ${name}=(\\[[\\s\\S]*?\\n\\]);`);
  const m = scriptText.match(re);
  if (!m) throw new Error(`Could not find array ${name} in script`);
  // eslint-disable-next-line no-eval
  const value = eval(m[1]);
  arrays[name.toLowerCase()] = value;
  scriptText = scriptText.replace(
    m[0],
    `const ${name}=window.__SITE__.arrays.${name.toLowerCase()};`
  );
}

$('script').first().html(scriptText);

writeFileSync(path.join(root, 'templates/site.template.html'), $.html());

const site = {
  fields,
  plain,
  arrays,
  updatedAt: new Date().toISOString(),
};

if (!existsSync(path.join(root, 'data'))) {
  writeFileSync(path.join(root, 'data/.gitkeep'), '');
}
writeFileSync(path.join(root, 'data/site.json'), JSON.stringify(site, null, 2));

console.log(`Extracted ${Object.keys(fields).length} bilingual fields, ${Object.keys(plain).length} plain fields, ${ARRAY_NAMES.length} arrays.`);
