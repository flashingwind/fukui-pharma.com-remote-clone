import { chromium } from 'playwright';

const BASE_URL = process.argv[2] || 'http://127.0.0.1:4173';
const MAX_FAILURES_LOG = 120;
const IGNORED_REQUEST_HOSTS = new Set([
  'www.google-analytics.com',
  'google-analytics.com',
  'www.googletagmanager.com',
  'googletagmanager.com',
]);
const SOFT_404_PATTERNS = [/このページはありません。?/];
const SKIP_CRAWL_PATH_PREFIXES = ['/cdn-cgi/'];
const MAX_CRAWL_PAGES = 250;

function normalizeBase(url) {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function isLocalBase(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1' || parsed.hostname === '::1';
  } catch {
    return false;
  }
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

function mapUrlToBase(url, base) {
  const baseParsed = new URL(base);
  const parsed = new URL(url, base);
  return `${baseParsed.origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
}

function normalizeForCrawl(url, base) {
  const parsed = new URL(url, base);
  parsed.search = '';
  parsed.hash = '';
  return `${parsed.origin}${parsed.pathname}`;
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

function shouldSkipCrawl(url, baseOrigin) {
  try {
    const parsed = new URL(url);
    if (parsed.origin !== baseOrigin) {
      return true;
    }
    if (SKIP_CRAWL_PATH_PREFIXES.some((prefix) => parsed.pathname.startsWith(prefix))) {
      return true;
    }
    if (/\.(?:gif|jpe?g|png|webp|svg|ico|css|js|xml|txt|pdf|woff2?|ttf|eot|mp4|webm)$/i.test(parsed.pathname)) {
      return true;
    }
    return false;
  } catch {
    return true;
  }
}

async function checkSinglePage(page, url, baseOrigin) {
  const pageFailures = [];
  const discoveredLinks = [];
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
      return { failures: pageFailures, discoveredLinks };
    }

    await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {
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

    const soft404 = await page.evaluate((patterns) => {
      const text = document.body?.innerText || '';
      return patterns.some((pattern) => {
        try {
          const re = new RegExp(pattern, 'i');
          return re.test(text);
        } catch {
          return false;
        }
      });
    }, SOFT_404_PATTERNS.map((x) => x.source));

    if (soft404) {
      pageFailures.push(`soft404 ${url} :: page contains \"このページはありません\"`);
    }

    const links = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a[href]'));
      return anchors.map((a) => a.href).filter(Boolean);
    });

    for (const href of links) {
      try {
        const parsed = new URL(href);
        if (parsed.origin === baseOrigin) {
          discoveredLinks.push(href);
        }
      } catch {
        // ignore invalid href values
      }
    }

    return { failures: pageFailures, discoveredLinks };
  } finally {
    page.off('requestfailed', onRequestFailed);
    page.off('console', onConsole);
    page.off('pageerror', onPageError);
  }
}

async function main() {
  const base = normalizeBase(BASE_URL);
  const parsed = new URL(base);
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    console.error(`fatal: only http/https is supported: ${base}`);
    process.exit(1);
  }
  if (!isLocalBase(base)) {
    console.error(`fatal: local-only check-live refuses non-local URL: ${base}`);
    process.exit(1);
  }

  const sitemapUrlsRaw = await fetchSitemapUrls(base);
  const sitemapUrls = sitemapUrlsRaw.map((url) => mapUrlToBase(url, base));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: parsed.protocol === 'http:' });
  const page = await context.newPage();
  const baseOrigin = parsed.origin;

  const queue = [base, ...sitemapUrls];
  const seen = new Set();
  const failures = [];

  while (queue.length > 0) {
    if (seen.size >= MAX_CRAWL_PAGES) {
      break;
    }
    const next = queue.shift();
    const current = normalizeForCrawl(next, base);

    if (seen.has(current)) {
      continue;
    }
    seen.add(current);

    if (shouldSkipCrawl(current, baseOrigin)) {
      continue;
    }
    if (seen.size % 20 === 0) {
      console.log(`progress_checked=${seen.size}`);
    }

    const { failures: pageFailures, discoveredLinks } = await checkSinglePage(page, current, baseOrigin);
    failures.push(...pageFailures);

    for (const link of discoveredLinks) {
      const normalized = normalizeForCrawl(link, base);
      if (!seen.has(normalized) && !shouldSkipCrawl(normalized, baseOrigin)) {
        queue.push(normalized);
      }
    }
  }
  if (seen.size >= MAX_CRAWL_PAGES && queue.length > 0) {
    console.log(`warn=crawl_cap_reached:${MAX_CRAWL_PAGES}`);
  }

  await context.close();
  await browser.close();

  console.log('mode=browser-crawl');
  console.log(`base_url=${base}`);
  console.log(`checked_pages=${seen.size}`);
  console.log(`seed_sitemap=${sitemapUrls.length}`);
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
