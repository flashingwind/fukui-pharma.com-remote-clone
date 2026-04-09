// scripts/generate-sitemap.js
import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://fukui-pharma.com';
const CONTENT_DIR = path.resolve('content');
const PUBLIC_DIR = path.resolve('public');
const OUTPUT_FILE = path.join(PUBLIC_DIR, 'sitemap.xml');
const today = new Date().toISOString().split('T')[0];

function walk(dir, ext = '.md', baseUrl = '') {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath, ext, path.join(baseUrl, file)));
    } else if (file.endsWith(ext)) {
      const rel = path.relative(CONTENT_DIR, filePath).replace(/\\/g, '/');
      const url = `${SITE_URL}/${rel.replace(/\.md$/, '.html')}`;
      results.push(url);
    }
  });
  return results;
}

const urls = walk(CONTENT_DIR);

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
  .map(
    url => `  <url>\n    <loc>${url}</loc>\n    <lastmod>${today}T00:00:00+09:00</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`
  )
  .join('\n')}\n</urlset>\n`;

fs.writeFileSync(OUTPUT_FILE, xml);
console.log(`sitemap.xml generated with ${urls.length} URLs.`);
