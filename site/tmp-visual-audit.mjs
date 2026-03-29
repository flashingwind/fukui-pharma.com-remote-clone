import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const base = '/Users/flashingwind/Documents/fukui-pharma.com-remote-clone/site/content';
const dirs = ['vitamins', 'minerals', 'travel', 'others', 'publication', 'shop', 'access'];
const slugSet = new Set();
for (const d of dirs) {
  const dir = path.join(base, d);
  if (!fs.existsSync(dir)) continue;
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith('.md')) continue;
    if (name === 'index.md' && d === 'access') slugSet.add('access');
    else if (name !== 'index.md') slugSet.add(name.replace(/\.md$/, ''));
  }
}
const slugs = [...slugSet].sort();

const outDir = '/tmp/fukui_compare';
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 1600 } });
const page = await context.newPage();

const rows = [];
for (const slug of slugs) {
  const row = { slug };
  const targets = [
    { key: 'remote', url: `https://fukui-pharma.com/${slug}.htm` },
    { key: 'local', url: `http://localhost:5173/${slug}` },
  ];

  for (const t of targets) {
    try {
      const res = await page.goto(t.url, { waitUntil: 'networkidle', timeout: 45000 });
      row[`${t.key}_status`] = res ? res.status() : null;
      await page.waitForTimeout(500);
      const file = path.join(outDir, `${slug}.${t.key}.png`);
      await page.screenshot({ path: file, fullPage: true });
      row[`${t.key}_shot`] = file;
    } catch (e) {
      row[`${t.key}_status`] = 'ERR';
      row[`${t.key}_error`] = String(e).slice(0, 500);
    }
  }
  rows.push(row);
  console.log(`done ${slug} remote=${row.remote_status} local=${row.local_status}`);
}

await browser.close();
fs.writeFileSync(path.join(outDir, 'audit.json'), JSON.stringify(rows, null, 2));
console.log(`saved ${path.join(outDir, 'audit.json')} total=${rows.length}`);
