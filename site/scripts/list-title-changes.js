import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const projectRoot = process.cwd();
const menuSource = readFileSync(path.resolve('src/components/MenuLeft.jsx'), 'utf8');
const flowersSource = readFileSync(path.resolve('src/generated/flowersIndex.js'), 'utf8');

const CONTENT_DIRS = ['vitamin-mineral', 'active-oxygen', 'atopic', 'flowers', 'travel', 'others', 'publication', 'shop', 'access'];
const VM = new Set([
  'eiyouso', 'ganyuute', 'aganyuu', 'eganyuu', 'dganyuu', 'bkganyuu', 'cganyuu', 'b1ganyuu', 'b2ganyuu', 'b3ganyuu',
  'b5ganyuu', 'b6ganyuu', 'b12ganyu', 'yousanga', 'biotinga', 'carugany', 'magganyu', 'karigany', 'aenganyu', 'tetugany',
  'douganyu', 'cromugan', 'mangagan', 'yo-dogan', 'serengan', 'moribuga', 'vanagany', 'senigany', 'keisogan', 'housogan',
  'gerumaga', 'coqganyu', 'colingan', 'inosigan', 'eiyou', 'vitasi2', 'vitasi3', 'vitasi4', 'serensir', 'magsiryou',
  'aensiryou', 'tetusiryou', 'shyoyou', 'lipoicacid', 'mokuzito', 'mokuzitu', 'suppuse',
]);
const AO = new Set(['kousanka']);

function exists(relPath) {
  return existsSync(path.join(projectRoot, relPath.replace(/^\//, '')));
}

function cleanLabel(raw) {
  return raw.replace(/<[^>]+>/g, ' ').replace(/[▶▼]/g, ' ').replace(/\s+/g, ' ').trim();
}

const flowerMap = new Map();
for (const m of flowersSource.matchAll(/'([^']+)'\s*:\s*'([^']+)'/g)) {
  flowerMap.set(m[1], m[2]);
}

function bySlug(slug) {
  if (VM.has(slug)) {
    const p = `/content/vitamin-mineral/${slug}.md`;
    if (exists(p)) return p;
  }
  if (AO.has(slug)) {
    const p = `/content/active-oxygen/${slug}.md`;
    if (exists(p)) return p;
  }
  if (flowerMap.has(slug)) return flowerMap.get(slug);
  for (const d of CONTENT_DIRS) {
    const p = `/content/${d}/${slug}.md`;
    if (exists(p)) return p;
  }
  return null;
}

function hrefToContent(href) {
  const clean = href.split('#')[0].split('?')[0].replace(/\.html?$/i, '');
  const parts = clean.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  if (parts.length === 0) return '/content/index.md';
  if (parts.length >= 2) {
    const p = `/content/${parts[0]}/${parts[1] === 'access' ? 'index' : parts[1]}.md`;
    return exists(p) ? p : null;
  }
  return bySlug(parts[0] === 'access' ? 'index' : parts[0]);
}

const menuMap = new Map();
for (const m of menuSource.matchAll(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)) {
  const href = m[1];
  if (!href.startsWith('/')) continue;
  const label = cleanLabel(m[2]);
  if (!label) continue;
  const contentPath = hrefToContent(href);
  if (!contentPath) continue;
  if (!menuMap.has(contentPath)) menuMap.set(contentPath, label);
}

const diff = execSync('git diff --unified=0 -- site/content', { encoding: 'utf8' });
const lines = diff.split(/\r?\n/);

let file = '';
let oldTitle = '';
const all = [];
for (const line of lines) {
  if (line.startsWith('diff --git a/site/content/')) {
    const m = line.match(/^diff --git a\/(.+) b\/(.+)$/);
    file = m ? m[2] : '';
    oldTitle = '';
    continue;
  }
  if (line.startsWith('-# ')) {
    oldTitle = line.slice(3).trim();
    continue;
  }
  if (line.startsWith('+# ')) {
    const newTitle = line.slice(3).trim();
    all.push({ file, oldTitle, newTitle });
    oldTitle = '';
  }
}

const menuBased = [];
const others = [];
for (const row of all) {
  const contentPath = '/' + row.file.replace(/^site\//, '');
  const menuTitle = menuMap.get(contentPath);
  if (menuTitle && menuTitle === row.newTitle) menuBased.push(row);
  else others.push(row);
}

console.log(`TOTAL\t${all.length}`);
console.log(`MENU_BASED\t${menuBased.length}`);
for (const r of menuBased) {
  console.log(`M\t${r.file}\t${r.oldTitle}\t=>\t${r.newTitle}`);
}
console.log(`OTHERS\t${others.length}`);
for (const r of others) {
  console.log(`O\t${r.file}\t${r.oldTitle}\t=>\t${r.newTitle}`);
}
