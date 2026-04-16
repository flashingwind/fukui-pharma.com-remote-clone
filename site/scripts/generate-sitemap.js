// scripts/generate-sitemap.js
import fs from 'fs';
import path from 'path';
import flowersIndex from '../src/generated/flowersIndex.js';

const SITE_URL = 'https://fukui-pharma.com';
const CONTENT_DIR = path.resolve('content');
const PUBLIC_DIR = path.resolve('public');
const OUTPUT_FILE = path.join(PUBLIC_DIR, 'sitemap.xml');
const today = new Date().toISOString().split('T')[0];
const CONTENT_DIRS = ['vitamin-mineral', 'supplement', 'active-oxygen', 'atopic', 'flowers', 'travel', 'others', 'publication', 'shop', 'access'];
const NUTRIENT_FOOD_SLUGS = new Set([
  'eiyouso', 'ganyuute',
  'aganyuu', 'eganyuu', 'dganyuu', 'bkganyuu', 'cganyuu', 'b1ganyuu', 'b2ganyuu', 'b3ganyuu',
  'b5ganyuu', 'b6ganyuu', 'b12ganyu', 'yousanga', 'biotinga',
  'carugany', 'magganyu', 'karigany', 'aenganyu', 'tetugany', 'douganyu', 'cromugan', 'mangagan',
  'yo-dogan', 'serengan', 'moribuga', 'vanagany', 'senigany', 'keisogan', 'housogan', 'gerumaga',
  'coqganyu', 'colingan', 'inosigan',
]);
const VITAMIN_MINERAL_INFO_SLUGS = new Set([
  'eiyou', 'vitasi2', 'vitasi3', 'vitasi4', 'serensir', 'magsiryou', 'aensiryou', 'tetusiryou',
  'shyoyou', 'lipoicacid', 'mokuzito', 'mokuzitu', 'suppuse',
]);
const ACTIVE_OXYGEN_SLUGS = new Set(['kousanka']);

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
      const url = `${SITE_URL}/${rel.replace(/\.md$/, '')}`;
      results.push(url);
    }
  });
  return results;
}

function isRenderablePath(pathname, contentPathSet) {
  const rawPath = pathname.replace(/^\/+|\/+$/g, '');
  const normalizedPath = rawPath.replace(/\.(htm|html)$/i, '');
  const exactPath = normalizedPath ? `/content/${normalizedPath}.md` : '/content/index.md';
  if (contentPathSet.has(exactPath)) {
    return true;
  }
  const segments = normalizedPath.split('/').filter(Boolean);
  const rawSection = segments.length > 1 ? segments[0] : null;
  const section = rawSection && CONTENT_DIRS.includes(rawSection) ? rawSection : null;
  const baseSlug = segments.length === 0 ? '' : segments[segments.length - 1];
  const isTop = baseSlug === '' || baseSlug === 'index' || baseSlug === 'index2';
  const contentSlug = baseSlug === 'access' ? 'index' : baseSlug;

  if (isTop) {
    return true;
  }

  const shouldRedirectToVitaminMineral = !section && segments.length === 1
    && (NUTRIENT_FOOD_SLUGS.has(contentSlug) || VITAMIN_MINERAL_INFO_SLUGS.has(contentSlug));
  if (shouldRedirectToVitaminMineral) {
    return contentPathSet.has(`/content/vitamin-mineral/nutrient-foods/${contentSlug}.md`)
      || contentPathSet.has(`/content/vitamin-mineral/${contentSlug}.md`);
  }

  const shouldRedirectToActiveOxygen = !section && segments.length === 1 && ACTIVE_OXYGEN_SLUGS.has(contentSlug);
  if (shouldRedirectToActiveOxygen) {
    return contentPathSet.has(`/content/active-oxygen/${contentSlug}.md`);
  }

  const orderedDirs = section
    ? [section, ...CONTENT_DIRS.filter((dir) => dir !== section)]
    : CONTENT_DIRS;

  const candidates = orderedDirs.flatMap((dir) => {
    if (dir === 'flowers' && flowersIndex[contentSlug]) {
      return [flowersIndex[contentSlug], `/content/flowers/${contentSlug}.md`];
    }
    return [`/content/${dir}/${contentSlug}.md`];
  });

  return candidates.some((candidate) => contentPathSet.has(candidate));
}

const allUrls = walk(CONTENT_DIR);
const contentPathSet = new Set(allUrls.map((url) => url.replace(SITE_URL, '/content').replace(/\/?$/, '.md')));
const urls = allUrls.filter((url) => {
  const pathname = url.replace(SITE_URL, '');
  return isRenderablePath(pathname, contentPathSet);
});

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
  .map(
    url => `  <url>\n    <loc>${url}</loc>\n    <lastmod>${today}T00:00:00+09:00</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`
  )
  .join('\n')}\n</urlset>\n`;

fs.writeFileSync(OUTPUT_FILE, xml);
console.log(`sitemap.xml generated with ${urls.length} URLs.`);
