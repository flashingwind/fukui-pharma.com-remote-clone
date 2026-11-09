import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  walk,
  fileToUrl,
  collectUrls,
  buildSitemapXml,
  SITE_URL,
} from './generate-sitemap.js';

// The module uses CONTENT_DIR = path.resolve('src', 'content') by default, but
// every exported function accepts an explicit directory, so tests operate on a
// temp fixture tree instead of touching the real content directory.
let tmpDir;

function createContentTree(entries) {
  // entries: array of relative paths (e.g. 'flowers/cattleya/cattleya.md')
  for (const rel of entries) {
    const abs = path.join(tmpDir, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, '---\ntitle: test\n---\ncontent\n');
  }
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sitemap-test-'));
  // Mirror the project layout: the fixture content dir lives under a fake root.
  tmpDir = path.join(tmpDir, 'project', 'src', 'content');
  fs.mkdirSync(tmpDir, { recursive: true });
});

afterEach(() => {
  fs.rmSync(path.resolve(tmpDir, '..', '..'), { recursive: true, force: true });
});

describe('walk', () => {
  it('returns an empty array for an empty directory', () => {
    expect(walk(tmpDir)).toEqual([]);
  });

  it('finds markdown files in the top-level directory', () => {
    createContentTree(['about/fukui.md']);
    expect(walk(tmpDir)).toEqual([path.join(tmpDir, 'about', 'fukui.md')]);
  });

  it('recursively finds nested markdown files', () => {
    createContentTree(['flowers/cattleya/cattleya1.md', 'flowers/cattleya/cattleya22.md']);
    const results = walk(tmpDir).sort();
    expect(results).toHaveLength(2);
    expect(results[0]).toBe(path.join(tmpDir, 'flowers', 'cattleya', 'cattleya1.md'));
  });

  it('honors a custom extension', () => {
    fs.mkdirSync(path.join(tmpDir, 'others'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, 'others', 'a.md'), 'x');
    fs.writeFileSync(path.join(tmpDir, 'others', 'a.mdx'), 'x');
    expect(walk(tmpDir, '.mdx')).toEqual([path.join(tmpDir, 'others', 'a.mdx')]);
  });

  it('ignores non-matching files', () => {
    fs.mkdirSync(path.join(tmpDir, 'others'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, 'others', 'readme.txt'), 'x');
    fs.writeFileSync(path.join(tmpDir, 'others', 'img.png'), 'x');
    expect(walk(tmpDir)).toEqual([]);
  });

  it('does not follow non-directory entries named like directories (no crash on regular files)', () => {
    fs.writeFileSync(path.join(tmpDir, 'about.md'), 'x');
    expect(() => walk(tmpDir)).not.toThrow();
    expect(walk(tmpDir)).toEqual([path.join(tmpDir, 'about.md')]);
  });

  it('throws for a nonexistent directory', () => {
    expect(() => walk(path.join(tmpDir, 'nope'))).toThrow();
  });
});

describe('fileToUrl', () => {
  it('maps the content index.md to the site root', () => {
    expect(fileToUrl(path.join(tmpDir, 'index.md'), tmpDir)).toBe(`${SITE_URL}/`);
  });

  it('maps a known collection with a nested path', () => {
    expect(fileToUrl(path.join(tmpDir, 'flowers', 'cattleya', 'cattleya1.md'), tmpDir)).toBe(
      `${SITE_URL}/flowers/cattleya/cattleya1`
    );
  });

  it('rewrites the about collection to the /access route', () => {
    expect(fileToUrl(path.join(tmpDir, 'about', 'fukui.md'), tmpDir)).toBe(`${SITE_URL}/access/fukui`);
  });

  it('strips the .md extension from the URL', () => {
    expect(fileToUrl(path.join(tmpDir, 'travel', 'hawaibeach.md'), tmpDir)).toBe(
      `${SITE_URL}/travel/hawaibeach`
    );
  });

  it('returns null for an unknown collection', () => {
    expect(fileToUrl(path.join(tmpDir, 'recipes', 'cake.md'))).toBeNull();
  });

  it('returns null for a top-level file that is not index.md', () => {
    expect(fileToUrl(path.join(tmpDir, 'loose.md'))).toBeNull();
  });

  it('normalizes Windows-style separators (backslashes) to forward slashes', () => {
    // Build a Windows-style path without mangling the absolute prefix.
    const winPath = `${tmpDir}\\shop\\order.md`;
    expect(fileToUrl(winPath, tmpDir)).toBe(`${SITE_URL}/shop/order`);
  });
});

describe('collectUrls', () => {
  it('collects and sorts all mapped URLs and drops nulls', () => {
    createContentTree([
      'about/fukui.md',
      'flowers/cattleya/cattleya.md',
      'travel/hawaibeach.md',
      'index.md',
      'unknown/coll.md',
    ]);
    const urls = collectUrls(tmpDir);
    expect(urls).toEqual([
      `${SITE_URL}/`,
      `${SITE_URL}/access/fukui`,
      `${SITE_URL}/flowers/cattleya/cattleya`,
      `${SITE_URL}/travel/hawaibeach`,
    ]);
  });

  it('deduplicates identical URLs (case where mapping collapses two paths)', () => {
    createContentTree(['travel/a.md']);
    const urls = collectUrls(tmpDir);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it('returns an empty array when nothing is mappable', () => {
    createContentTree(['unknown/x.md']);
    expect(collectUrls(tmpDir)).toEqual([]);
  });
});

describe('buildSitemapXml', () => {
  const expectedEntry = url =>
    `  <url>\n    <loc>${url}</loc>\n    <lastmod>2026-01-31T00:00:00+09:00</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`;

  it('produces a well-formed sitemap with the required header', () => {
    const xml = buildSitemapXml([`${SITE_URL}/travel/a`], { lastmod: '2026-01-31' });
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml.endsWith('</urlset>\n')).toBe(true);
  });

  it('includes one <url> entry per input URL', () => {
    const urls = [`${SITE_URL}/`, `${SITE_URL}/shop/order`];
    const xml = buildSitemapXml(urls, { lastmod: '2026-01-31' });
    expect(xml.match(/<loc>/g)).toHaveLength(2);
    for (const url of urls) expect(xml).toContain(`<loc>${url}</loc>`);
  });

  it('emits entries in the order given (caller is responsible for sorting)', () => {
    const urls = [`${SITE_URL}/b`, `${SITE_URL}/a`];
    const xml = buildSitemapXml(urls, { lastmod: '2026-01-31' });
    expect(xml.indexOf(`${SITE_URL}/b`)).toBeLessThan(xml.indexOf(`${SITE_URL}/a`));
  });

  it('uses the provided lastmod for every entry', () => {
    const xml = buildSitemapXml([`${SITE_URL}/x`], { lastmod: '2025-12-24' });
    expect(xml.match(/<lastmod>2025-12-24T00:00:00\+09:00<\/lastmod>/g)).toHaveLength(1);
  });

  it('defaults lastmod to today (Asia/Tokyo, en-CA format)', () => {
    const expected = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
    const xml = buildSitemapXml([`${SITE_URL}/x`]);
    expect(xml).toContain(`<lastmod>${expected}T00:00:00+09:00</lastmod>`);
  });

  it('returns an empty <urlset> when there are no URLs', () => {
    const xml = buildSitemapXml([], { lastmod: '2026-01-31' });
    expect(xml).toBe(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n</urlset>\n`
    );
    expect(xml).not.toContain('<url>');
  });

  it('formats the exact entry shape', () => {
    const xml = buildSitemapXml([`${SITE_URL}/shop/order`], { lastmod: '2026-01-31' });
    expect(xml).toContain(expectedEntry(`${SITE_URL}/shop/order`));
  });
});

describe('integration: collectUrls + buildSitemapXml', () => {
  it('generates a valid sitemap from a content tree', () => {
    createContentTree(['index.md', 'about/fukui.md', 'travel/a.md', 'skipme/none.md']);
    const xml = buildSitemapXml(collectUrls(tmpDir), { lastmod: '2026-01-31' });
    expect(xml.match(/<loc>/g)).toHaveLength(3);
    expect(xml).toContain(`<loc>${SITE_URL}/</loc>`);
    expect(xml).not.toContain('skipme');
  });
});
