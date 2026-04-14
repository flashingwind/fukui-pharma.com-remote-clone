import fs from 'fs';
import path from 'path';

const CONTENT_DIR = path.resolve('content');
const WRITE = process.argv.includes('--write');

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

function isExternalHref(href) {
  return /^https?:/i.test(href) || /^mailto:/i.test(href) || /^javascript:/i.test(href) || href.startsWith('#');
}

function splitHref(href) {
  const hashIdx = href.indexOf('#');
  const queryIdx = href.indexOf('?');
  const cut = [hashIdx, queryIdx].filter((x) => x >= 0).sort((a, b) => a - b)[0];
  if (cut === undefined) return { base: href, suffix: '' };
  return { base: href.slice(0, cut), suffix: href.slice(cut) };
}

function stripExt(p) {
  return p.replace(/\.(md|htm|html)$/i, '');
}

function normalizePath(p) {
  return p.replace(/^\.?\/+/, '').replace(/\\/g, '/');
}

const mdFiles = walk(CONTENT_DIR, ['.md']);
const slugToPath = new Map();
const ambiguous = new Set();

for (const f of mdFiles) {
  const rel = path.relative(CONTENT_DIR, f).replace(/\\/g, '/');
  const relNoExt = rel.replace(/\.md$/i, '');
  const slug = path.basename(f, '.md').toLowerCase();
  if (slugToPath.has(slug)) {
    ambiguous.add(slug);
  } else {
    slugToPath.set(slug, relNoExt);
  }
}
for (const slug of ambiguous) {
  slugToPath.delete(slug);
}

let changedFiles = 0;
let fixedLinks = 0;

for (const mdPath of mdFiles) {
  const original = fs.readFileSync(mdPath, 'utf8');
  let next = original;

  next = next.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (full, label, href) => {
    const trimmedHref = href.trim();
    if (!trimmedHref || isExternalHref(trimmedHref)) return full;

    const { base, suffix } = splitHref(trimmedHref);
    const baseClean = normalizePath(stripExt(base));
    if (!baseClean || /\.[a-z0-9]+$/i.test(baseClean)) {
      return full;
    }

    const slug = path.basename(baseClean).toLowerCase();
    const mapped = slugToPath.get(slug);
    if (!mapped) return full;

    const target = `/${mapped}${suffix}`;
    const current = base.startsWith('/') ? `/${baseClean}${suffix}` : `/${baseClean}${suffix}`;
    if (current === target) return full;

    fixedLinks += 1;
    return `[${label}](${target})`;
  });

  if (next !== original) {
    changedFiles += 1;
    if (WRITE) fs.writeFileSync(mdPath, next);
  }
}

console.log(`mode=${WRITE ? 'write' : 'dry-run'}`);
console.log(`changedFiles=${changedFiles}`);
console.log(`fixedLinks=${fixedLinks}`);
