import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const slugs = process.argv.slice(2);
const outDir = '/tmp/fukui_compare';
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 1600 } });
const page = await context.newPage();

for (const slug of slugs) {
  const pairs = [
    { name: 'remote', url: `https://fukui-pharma.com/${slug}.htm` },
    { name: 'local', url: `http://localhost:5173/${slug}` },
  ];
  for (const p of pairs) {
    try {
      await page.goto(p.url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(500);
      const file = path.join(outDir, `${slug}.${p.name}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log('ok', slug, p.name, file);
    } catch (e) {
      console.log('err', slug, p.name, String(e).slice(0, 240));
    }
  }
}

await browser.close();
