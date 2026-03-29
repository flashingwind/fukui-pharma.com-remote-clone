import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 1600 } });
const page = await context.newPage();
await page.goto('https://fukui-pharma.com/index2.html', { waitUntil: 'networkidle', timeout: 45000 });
await page.screenshot({ path: '/tmp/fukui_compare/index2.remote.png', fullPage: true });
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 45000 });
await page.screenshot({ path: '/tmp/fukui_compare/index2.localroot.png', fullPage: true });
await browser.close();
