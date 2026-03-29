import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const sourceDir = '/Users/flashingwind/Documents/fukui-pharma.com-remote-clone';
const outDir = '/tmp/fukui_compare_body';
fs.mkdirSync(outDir, { recursive: true });

const slugs = fs.readdirSync(sourceDir)
  .filter((n) => n.endsWith('.htm'))
  .map((n) => n.replace(/\.htm$/, ''))
  .sort();

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1400, height: 2000 } });
const page = await context.newPage();

const rows = [];
for (const slug of slugs) {
  const row = { slug };
  try {
    await page.goto(`file://${sourceDir}/${slug}.htm`, { waitUntil: 'networkidle', timeout: 45000 });
    const body = page.locator('body');
    await body.screenshot({ path: path.join(outDir, `${slug}.base.body.png`) });
    row.base = 200;
  } catch (e) {
    row.base = 'ERR';
    row.base_error = String(e).slice(0, 200);
  }

  try {
    await page.goto(`http://localhost:5173/${slug}`, { waitUntil: 'networkidle', timeout: 45000 });
    const center = page.locator('#center');
    await center.screenshot({ path: path.join(outDir, `${slug}.local.center.png`) });
    row.local = 200;
  } catch (e) {
    row.local = 'ERR';
    row.local_error = String(e).slice(0, 200);
  }

  rows.push(row);
  console.log(`done ${slug} base=${row.base} local=${row.local}`);
}

await browser.close();
fs.writeFileSync(path.join(outDir, 'audit.json'), JSON.stringify(rows, null, 2));
console.log(`saved ${path.join(outDir, 'audit.json')} total=${rows.length}`);
