import fs from 'fs';
import path from 'path';

const CONTENT_DIR = path.resolve('content');
const TARGET_FILES = [
  path.resolve('src/components/MenuLeft.jsx'),
  path.resolve('src/App.jsx'),
];

function walk(dir, exts) {
  let out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out = out.concat(walk(p, exts));
      continue;
    }
    if (exts.some((ext) => p.endsWith(ext))) out.push(p);
  }
  return out;
}

function splitHref(href) {
  const hashIdx = href.indexOf('#');
  const queryIdx = href.indexOf('?');
  const cut = [hashIdx, queryIdx].filter((x) => x >= 0).sort((a, b) => a - b)[0];
  if (cut === undefined) return { base: href, suffix: '' };
  return { base: href.slice(0, cut), suffix: href.slice(cut) };
}

function isExternalHref(href) {
  return /^https?:/i.test(href) || /^mailto:/i.test(href) || /^javascript:/i.test(href) || href.startsWith('#');
}

const mdFiles = walk(CONTENT_DIR, ['.md']);
const slugMap = new Map();
const keyMap = new Map();
const ambiguousSlug = new Set();
const ambiguousKey = new Set();

for (const f of mdFiles) {
  const rel = path.relative(CONTENT_DIR, f).replace(/\\/g, '/');
  const relNoExt = rel.replace(/\.md$/i, '');
  const slug = path.basename(relNoExt).toLowerCase();
  if (slugMap.has(slug)) {
    ambiguousSlug.add(slug);
  } else {
    slugMap.set(slug, relNoExt);
  }

  const parts = relNoExt.split('/');
  if (parts.length >= 2) {
    const section = parts[0];
    const key = `${section}/${slug}`.toLowerCase();
    if (keyMap.has(key)) {
      ambiguousKey.add(key);
    } else {
      keyMap.set(key, relNoExt);
    }
  }
}
for (const slug of ambiguousSlug) slugMap.delete(slug);
for (const key of ambiguousKey) keyMap.delete(key);

function mapPath(basePath) {
  const cleaned = basePath.replace(/^\/+/, '').replace(/\.(md|htm|html)$/i, '');
  const lower = cleaned.toLowerCase();
  if (keyMap.has(lower)) return keyMap.get(lower);
  if (slugMap.has(lower)) return slugMap.get(lower);
  return null;
}

for (const filePath of TARGET_FILES) {
  const original = fs.readFileSync(filePath, 'utf8');
  let next = original;

  next = next.replace(/href=\"([^\"]+)\"/g, (full, href) => {
    const trimmed = href.trim();
    if (!trimmed || isExternalHref(trimmed)) return full;

    const { base, suffix } = splitHref(trimmed);
    if (!base.startsWith('/')) return full;

    const mapped = mapPath(base);
    if (!mapped) return full;

    const replaced = `/${mapped}${suffix}`;
    if (replaced === trimmed) return full;
    return `href=\"${replaced}\"`;
  });

  if (next !== original) {
    fs.writeFileSync(filePath, next);
  }
}

console.log('done=normalize-js-links');
