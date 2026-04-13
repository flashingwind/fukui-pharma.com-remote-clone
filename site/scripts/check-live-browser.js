import { chromium } from 'playwright';

const BASE_URL = process.argv[2] || 'https://fukui-pharma.com';
const MAX_FAILURES_LOG = 120;
const IGNORED_REQUEST_HOSTS = new Set([
  'www.google-analytics.com',
  'google-analytics.com',
  'www.googletagmanager.com',
  'googletagmanager.com',
]);

function normalizeBase(url) {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function isCiEnv() {
  return process.env.CI === '1' || process.env.CI === 'true';
}

async function fetchSitemapUrls(base) {
  const sitemapUrl = `${base}/sitemap.xml`;
  const res = await fetch(sitemapUrl, { redirect: 'follow' });
  if (!res.ok) {
    throw new Error(`failed to fetch sitemap: ${res.status}`);
  }
  const xml = await res.text();
  const urls = [];
  const re = /<loc>([^<]+)<\/loc>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    urls.push(m[1].trim());
  }
  return urls;
}

function isIgnoredRequest(url, baseOrigin) {
  try {
    const parsed = new URL(url);
    if (parsed.origin !== baseOrigin && IGNORED_REQUEST_HOSTS.has(parsed.hostname)) {
      return true;
    }
    if (parsed.origin === baseOrigin && parsed.pathname.startsWith('/cdn-cgi/')) {
      return true;
    }
    return false;
  } catch {
    return true;
  }
}

async function checkSinglePage(page, url, baseOrigin) {
  const pageFailures = [];
  const reqFailures = [];
  const consoleErrors = [];
  const runtimeErrors = [];
  const seenRequestFailures = new Set();

  const onRequestFailed = (req) => {
    if (isIgnoredRequest(req.url(), baseOrigin)) {
      return;
    }
    const failure = req.failure();
    const line = `${req.method()} ${req.url()} :: ${failure?.errorText || 'requestfailed'}`;
    if (!seenRequestFailures.has(line)) {
      seenRequestFailures.add(line);
      reqFailures.push(line);
    }
  };
  const onConsole = (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  };
  const onPageError = (err) => {
    runtimeErrors.push(String(err));
  };

  page.on('requestfailed', onRequestFailed);
  page.on('console', onConsole);
  page.on('pageerror', onPageError);

  try {
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    if (!response || !response.ok()) {
      pageFailures.push(`HTTP ${response ? response.status() : 0} at ${url}`);
      return pageFailures;
    }

    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {
      // Some pages may keep connections open; domcontentloaded is enough for this check.
    });

    const brokenImages = await page.evaluate(() => {
      const imgs = Array.from(document.images);
      return imgs
        .filter((img) => img.complete && img.naturalWidth === 0)
        .map((img) => img.currentSrc || img.getAttribute('src') || '(unknown)');
    });

    for (const src of [...new Set(brokenImages)]) {
      if (isIgnoredRequest(src, baseOrigin)) {
        continue;
      }
      pageFailures.push(`broken-image ${url} :: ${src}`);
    }

    for (const line of reqFailures) {
      pageFailures.push(`requestfailed ${url} :: ${line}`);
    }
    for (const line of consoleErrors) {
      pageFailures.push(`console-error ${url} :: ${line}`);
    }
    for (const line of runtimeErrors) {
      pageFailures.push(`pageerror ${url} :: ${line}`);
    }

    return pageFailures;
  } finally {
    page.off('requestfailed', onRequestFailed);
    page.off('console', onConsole);
    page.off('pageerror', onPageError);
  }
}

async function main() {
  if (isCiEnv()) {
    console.log('mode=skip');
    console.log('reason=CI environment');
    process.exit(0);
  }

  const base = normalizeBase(BASE_URL);
  const parsed = new URL(base);
  if (parsed.protocol !== 'https:') {
    console.error(`fatal: only https is supported: ${base}`);
    process.exit(1);
  }

  const sitemapUrls = await fetchSitemapUrls(base);
  const urls = [...new Set([base, ...sitemapUrls])];

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: false });
  const page = await context.newPage();
  const baseOrigin = parsed.origin;

  const failures = [];
  for (const url of urls) {
    const result = await checkSinglePage(page, url, baseOrigin);
    failures.push(...result);
  }

  await context.close();
  await browser.close();

  console.log(`mode=local`);
  console.log(`base_url=${base}`);
  console.log(`checked_pages=${urls.length}`);
  console.log(`failures=${failures.length}`);

  for (const line of failures.slice(0, MAX_FAILURES_LOG)) {
    console.log(line);
  }

  process.exit(failures.length > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(`fatal: ${error.message}`);
  process.exit(1);
});
