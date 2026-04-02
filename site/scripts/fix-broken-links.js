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

function normalizeLabel(text = '') {
  return String(text)
    // HTML line breaks and markdown hard-break backslashes are equivalent.
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/\\\r?\n?/g, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/[\s\u3000]+/g, '')
    .replace(/[\\\[\](){}「」『』【】]/g, '')
    .trim()
    .toLowerCase();
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

function isPageHref(base) {
  return /\.(htm|html|md)$/i.test(base);
}

function toSlug(base) {
  return path.basename(base).replace(/\.(htm|html|md)$/i, '').toLowerCase();
}

function extractHtmlLinkMap(htmlText) {
  const map = new Map();
  const re = /<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(htmlText)) !== null) {
    const href = m[1].trim();
    const label = normalizeLabel(m[2]);
    if (!label || !href || isExternalHref(href)) continue;
    if (!map.has(label)) map.set(label, href);
  }
  return map;
}

const mdFiles = walk(CONTENT_DIR, ['.md']);
const htmlFiles = walk(CONTENT_DIR, ['.htm', '.html']);

const slugToMd = new Map();
for (const f of mdFiles) {
  const slug = path.basename(f, '.md').toLowerCase();
  if (!slugToMd.has(slug)) slugToMd.set(slug, []);
  slugToMd.get(slug).push(f);
}

const titleToSlug = new Map();
for (const f of mdFiles) {
  const slug = path.basename(f, '.md').toLowerCase();
  const lines = fs.readFileSync(f, 'utf8').split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line === '---' || line === '\\') continue;
    const heading = line.replace(/^#{1,6}\s*/, '');
    const norm = normalizeLabel(heading);
    if (!norm) continue;
    if (!titleToSlug.has(norm)) titleToSlug.set(norm, slug);
    if (heading.includes('を多く含む食品')) {
      const short = normalizeLabel(heading.replace('を多く含む食品', ''));
      if (short && !titleToSlug.has(short)) titleToSlug.set(short, slug);
    }
    break;
  }
}

const htmlByBase = new Map();
for (const h of htmlFiles) {
  const base = h.replace(/\.(htm|html)$/i, '');
  if (!htmlByBase.has(base)) htmlByBase.set(base, h);
}

let changedFiles = 0;
let fixedLinks = 0;
const unresolved = [];

for (const mdPath of mdFiles) {
  const original = fs.readFileSync(mdPath, 'utf8');
  let next = original;

  const baseNoExt = mdPath.replace(/\.md$/i, '');
  const htmlSibling = htmlByBase.get(baseNoExt);
  const siblingMap = htmlSibling ? extractHtmlLinkMap(fs.readFileSync(htmlSibling, 'utf8')) : new Map();

  next = next.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (full, label, href) => {
    const trimmedHref = href.trim();
    if (isExternalHref(trimmedHref)) return full;

    const { base, suffix } = splitHref(trimmedHref);
    if (!isPageHref(base)) return full;

    const slug = toSlug(base);
    const targets = slugToMd.get(slug) || [];
    if (targets.length === 1) return full;

    const normLabel = normalizeLabel(label);
    let repairedHref = null;

    const candidateFromHtml = siblingMap.get(normLabel);
    if (candidateFromHtml) {
      const c = splitHref(candidateFromHtml);
      const cSlug = toSlug(c.base);
      const cTargets = slugToMd.get(cSlug) || [];
      if (cTargets.length === 1) {
        repairedHref = candidateFromHtml;
      }
    }

    if (!repairedHref) {
      const fromTitle = titleToSlug.get(normLabel);
      if (fromTitle && (slugToMd.get(fromTitle) || []).length === 1) {
        repairedHref = `${fromTitle}.htm${suffix}`;
      }
    }

    if (!repairedHref) {
      unresolved.push(`${path.relative(CONTENT_DIR, mdPath)} :: [${label}](${href})`);
      return full;
    }

    fixedLinks += 1;
    return `[${label}](${repairedHref})`;
  });

  if (next !== original) {
    changedFiles += 1;
    if (WRITE) fs.writeFileSync(mdPath, next);
  }
}

console.log(`mode=${WRITE ? 'write' : 'dry-run'}`);
console.log(`changedFiles=${changedFiles}`);
console.log(`fixedLinks=${fixedLinks}`);
console.log(`unresolved=${unresolved.length}`);
if (unresolved.length) {
  console.log('--- unresolved examples ---');
  for (const line of unresolved.slice(0, 30)) console.log(line);
}
