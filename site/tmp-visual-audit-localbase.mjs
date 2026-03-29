import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const project = '/Users/flashingwind/Documents/fukui-pharma.com-remote-clone/site';
const sourceDir = '/Users/flashingwind/Documents/fukui-pharma.com-remote-clone';
const outDir = '/tmp/fukui_compare_localbase';
fs.mkdirSync(outDir, { recursive: true });

const slugs = fs.readdirSync(sourceDir)
  .filter((n) => n.endsWith('.htm'))
  .map((n) => n.replace(/\.htm$/, ''))
  .sort();

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 1600 } });
const page = await context.newPage();

const rows = [];
for (const slug of slugs) {
  const row = { slug };
  const baseUrl = `file://${sourceDir}/${slug}.htm`;
  const localUrl = `http://localhost:5173/${slug}`;

  for (const [key, url] of [['base', baseUrl], ['local', localUrl]]) {
    try {
      const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
      row[`${key}_status`] = res ? res.status() : 'file';
      await page.waitForTimeout(300);
      const shot = path.join(outDir, `${slug}.${key}.png`);
      await page.screenshot({ path: shot, fullPage: true });
      row[`${key}_shot`] = shot;
    } catch (e) {
      row[`${key}_status`] = 'ERR';
      row[`${key}_error`] = String(e).slice(0, 300);
    }
  }

  rows.push(row);
  console.log(`done ${slug} base=${row.base_status} local=${row.local_status}`);
}
await browser.close();
fs.writeFileSync(path.join(outDir, 'audit.json'), JSON.stringify(rows, null, 2));
console.log(`saved ${path.join(outDir, 'audit.json')} total=${rows.length}`);
