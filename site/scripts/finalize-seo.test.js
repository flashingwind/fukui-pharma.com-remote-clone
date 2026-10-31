import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { finalizeSeo } from './lib/finalize-seo.js';

test('canonical sitemap, redirects, and links agree without changing the archived text', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fukui-seo-'));
  try {
    const writePage = (route, canonical, body, robots = '') => {
      const file = path.join(dir, route, 'index.html');
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, `<html><head><link rel="canonical" href="https://fukui-pharma.com${canonical}">${robots}</head><body>${body}</body></html>`);
    };
    const body = '<h1>著者の文章</h1><a href="/old?view=1#photo">当時の説明</a><img src="/photo.jpg"><a href="https://example.com/old">外部</a>';
    writePage('', '/', body);
    writePage('article', '/article/', '<h1>保存資料</h1>');
    writePage('old', '/article/', '<h1>保存資料</h1>');
    writePage('draft', '/draft/', '<h1>未完成</h1>', '<meta name="robots" content="noindex,follow">');
    fs.writeFileSync(path.join(dir, '_redirects'), '/ /index.html 301\n/old /old/ 301\n/older.html /old/ 301\n');
    finalizeSeo(dir);
    const xml = fs.readFileSync(path.join(dir, 'sitemap.xml'), 'utf8');
    assert.equal((xml.match(/<loc>/g) || []).length, 2);
    assert.ok(xml.includes('https://fukui-pharma.com/article/'));
    assert.ok(!xml.includes('/old'));
    assert.ok(!xml.includes('/draft'));
    assert.equal(xml, fs.readFileSync(path.join(dir, 'sitemap-0.xml'), 'utf8'));
    const redirects = fs.readFileSync(path.join(dir, '_redirects'), 'utf8');
    for (const rule of ['/old /article/ 301', '/old/ /article/ 301', '/older.html /article/ 301', '/article /article/ 301']) assert.ok(redirects.includes(rule));
    assert.ok(!redirects.includes('/ /index.html'));
    const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
    assert.ok(html.includes(body.replace('/old?view=1#photo', '/article/?view=1#photo')));
    assert.ok(fs.existsSync(path.join(dir, 'draft/index.html')));
    // A repeated build finalization must not accumulate duplicate redirects.
    finalizeSeo(dir);
    assert.equal(redirects, fs.readFileSync(path.join(dir, '_redirects'), 'utf8'));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
