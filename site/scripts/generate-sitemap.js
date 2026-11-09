import fs from 'fs';
import path from 'path';

export const SITE_URL = 'https://fukui-pharma.com';
const CONTENT_DIR = path.resolve('src', 'content');
const PUBLIC_DIR = path.resolve('public');
const OUTPUT_FILE = path.join(PUBLIC_DIR, 'sitemap.xml');
const today = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Tokyo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(new Date());

const COLLECTION_ROUTE_MAP = {
  'active-oxygen': 'active-oxygen',
  about: 'access',
  atopic: 'atopic',
  flowers: 'flowers',
  'nutrient-foods': 'nutrient-foods',
  others: 'others',
  shop: 'shop',
  supplement: 'supplement',
  travel: 'travel',
  'vitamin-mineral': 'vitamin-mineral',
};

export function walk(dir, ext = '.md') {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath, ext));
    } else if (file.endsWith(ext)) {
      results.push(filePath);
    }
  });
  return results;
}

export function fileToUrl(filePath, contentDir = CONTENT_DIR) {
  // Normalize Windows-style separators before relativizing, so paths like
  // C:\...\content\shop\order.md resolve correctly on any platform.
  const normalized = filePath.replace(/\\/g, '/');
  const rel = path.relative(String(contentDir).replace(/\\/g, '/'), normalized);
  if (rel === 'index.md') {
    return `${SITE_URL}/`;
  }

  const [collection, ...rest] = rel.replace(/\.md$/, '').split('/');
  const routeCollection = COLLECTION_ROUTE_MAP[collection];
  if (!routeCollection || rest.length === 0) {
    return null;
  }

  return `${SITE_URL}/${[routeCollection, ...rest].join('/')}`;
}

export function buildSitemapXml(urls, { lastmod = today } = {}) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(
      url => `  <url>\n    <loc>${url}</loc>\n    <lastmod>${lastmod}T00:00:00+09:00</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`
    )
    .join('\n')}\n</urlset>\n`;
}

export function collectUrls(contentDir = CONTENT_DIR) {
  return [...new Set(walk(contentDir)
    .filter(file => !/^noindex:\s*true\s*$/m.test(fs.readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] || ''))
    .map(file => fileToUrl(file, contentDir)).filter(Boolean))].sort();
}

function main() {
  const urls = collectUrls(CONTENT_DIR);
  fs.writeFileSync(OUTPUT_FILE, buildSitemapXml(urls));
  console.log(`sitemap.xml generated with ${urls.length} URLs.`);
}

main();
