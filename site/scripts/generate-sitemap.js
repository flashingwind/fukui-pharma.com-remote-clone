import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://fukui-pharma.com';
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

function walk(dir, ext = '.md') {
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

function fileToUrl(filePath) {
  const rel = path.relative(CONTENT_DIR, filePath).replace(/\\/g, '/');
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

const urls = [...new Set(walk(CONTENT_DIR).map(fileToUrl).filter(Boolean))].sort();

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
  .map(
    url => `  <url>\n    <loc>${url}</loc>\n    <lastmod>${today}T00:00:00+09:00</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`
  )
  .join('\n')}\n</urlset>\n`;

fs.writeFileSync(OUTPUT_FILE, xml);
console.log(`sitemap.xml generated with ${urls.length} URLs.`);
