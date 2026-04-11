import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const contentRoot = path.join(projectRoot, 'content');
const menuPath = path.join(projectRoot, 'src/components/MenuLeft.jsx');
const flowersIndexPath = path.join(projectRoot, 'src/generated/flowersIndex.js');

const CONTENT_DIRS = ['vitamin-mineral', 'active-oxygen', 'atopic', 'flowers', 'travel', 'others', 'publication', 'shop', 'access'];
const VITAMIN_MINERAL_SLUGS = new Set([
  'eiyouso', 'ganyuute',
  'aganyuu', 'eganyuu', 'dganyuu', 'bkganyuu', 'cganyuu', 'b1ganyuu', 'b2ganyuu', 'b3ganyuu',
  'b5ganyuu', 'b6ganyuu', 'b12ganyu', 'yousanga', 'biotinga',
  'carugany', 'magganyu', 'karigany', 'aenganyu', 'tetugany', 'douganyu', 'cromugan', 'mangagan',
  'yo-dogan', 'serengan', 'moribuga', 'vanagany', 'senigany', 'keisogan', 'housogan', 'gerumaga',
  'coqganyu', 'colingan', 'inosigan',
  'eiyou', 'vitasi2', 'vitasi3', 'vitasi4', 'serensir', 'magsiryou', 'aensiryou', 'tetusiryou',
  'shyoyou', 'lipoicacid', 'mokuzito', 'mokuzitu', 'suppuse',
]);
const ACTIVE_OXYGEN_SLUGS = new Set(['kousanka']);

function toPosix(filePath) {
  return filePath.replace(/\\/g, '/');
}

function cleanLabel(label) {
  return label
    .replace(/<[^>]+>/g, ' ')
    .replace(/[\u25b6\u25bc]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseFlowersIndexMap(source) {
  const map = new Map();
  const regex = /'([^']+)'\s*:\s*'([^']+)'/g;
  let match;
  while ((match = regex.exec(source)) !== null) {
    map.set(match[1], match[2]);
  }
  return map;
}

function findBySlug(slug, flowersIndexMap) {
  if (VITAMIN_MINERAL_SLUGS.has(slug)) {
    const p = `/content/vitamin-mineral/${slug}.md`;
    if (fs.existsSync(path.join(projectRoot, p.slice(1)))) return p;
  }
  if (ACTIVE_OXYGEN_SLUGS.has(slug)) {
    const p = `/content/active-oxygen/${slug}.md`;
    if (fs.existsSync(path.join(projectRoot, p.slice(1)))) return p;
  }
  if (flowersIndexMap.has(slug)) {
    return flowersIndexMap.get(slug);
  }
  for (const dir of CONTENT_DIRS) {
    const p = `/content/${dir}/${slug}.md`;
    if (fs.existsSync(path.join(projectRoot, p.slice(1)))) return p;
  }
  return null;
}

function resolveHrefToContentPath(href, flowersIndexMap) {
  const clean = href.split('#')[0].split('?')[0].replace(/\.html?$/i, '');
  const parts = clean.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  if (parts.length === 0) {
    return '/content/index.md';
  }
  if (parts.length >= 2) {
    const section = parts[0];
    const slug = parts[1] === 'access' ? 'index' : parts[1];
    const p = `/content/${section}/${slug}.md`;
    if (fs.existsSync(path.join(projectRoot, p.slice(1)))) return p;
    return null;
  }
  const slug = parts[0] === 'access' ? 'index' : parts[0];
  return findBySlug(slug, flowersIndexMap);
}

function buildMenuTitleMap(menuSource, flowersIndexMap) {
  const map = new Map();
  const anchorRegex = /<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
  let m;
  while ((m = anchorRegex.exec(menuSource)) !== null) {
    const href = m[1];
    if (!href.startsWith('/')) continue;
    const label = cleanLabel(m[2]);
    if (!label) continue;
    const contentPath = resolveHrefToContentPath(href, flowersIndexMap);
    if (!contentPath) continue;
    if (!map.has(contentPath)) {
      map.set(contentPath, label);
    }
  }
  return map;
}

function listMarkdownFiles(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) {
      listMarkdownFiles(full, out);
    } else if (name.endsWith('.md')) {
      out.push(full);
    }
  }
  return out;
}

function isSuspiciousTitle(currentTitle, filePath) {
  const slug = path.basename(filePath, '.md');
  if (currentTitle.endsWith('\\')) return true;
  if (currentTitle === slug) return true;
  if (/^[A-Za-z0-9_-]+$/.test(currentTitle) && currentTitle.length <= 20) return true;
  return false;
}

function main() {
  const menuSource = fs.readFileSync(menuPath, 'utf8');
  const flowersSource = fs.readFileSync(flowersIndexPath, 'utf8');
  const flowersIndexMap = parseFlowersIndexMap(flowersSource);
  const menuTitleMap = buildMenuTitleMap(menuSource, flowersIndexMap);

  const files = listMarkdownFiles(contentRoot);
  let changed = 0;
  const samples = [];

  for (const file of files) {
    const rel = '/' + toPosix(path.relative(projectRoot, file));
    const menuTitle = menuTitleMap.get(rel);
    if (!menuTitle) continue;

    const src = fs.readFileSync(file, 'utf8');
    const lines = src.split(/\r?\n/);
    if (!lines[0] || !lines[0].startsWith('# ')) continue;

    const currentTitle = lines[0].slice(2).trim();
    if (!isSuspiciousTitle(currentTitle, file)) continue;
    if (currentTitle === menuTitle) continue;

    lines[0] = '# ' + menuTitle;
    fs.writeFileSync(file, lines.join('\n'));
    changed += 1;
    if (samples.length < 30) {
      samples.push(`${rel} :: ${currentTitle} -> ${menuTitle}`);
    }
  }

  console.log(`menu-based heading fixes: ${changed}`);
  for (const row of samples) {
    console.log(row);
  }
}

main();
