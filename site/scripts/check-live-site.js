const BASE_URL = process.argv[2] || 'http://127.0.0.1:4173';
const FETCH_RETRIES = Number(process.env.CHECK_LIVE_FETCH_RETRIES || 3);
const FETCH_TIMEOUT_MS = Number(process.env.CHECK_LIVE_FETCH_TIMEOUT_MS || 15000);

const ASSET_EXT_RE = /\.(gif|jpe?g|png|webp|svg|ico|css|js|xml|txt|pdf|woff2?|ttf|eot|mp4|webm)$/i;

const CRITICAL_URLS = [
  '/icon/new.svg',
  '/supplement/sinhon5.jpg',
  '/supplement/megasin.gif',
  '/supplement/betasin.gif',
  '/publication/sinhon5.jpg',
  '/others/megasin.gif',
  '/others/betasin.gif',
];

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

function mapUrlToBase(url, base) {
  const baseParsed = new URL(base);
  const parsed = new URL(url, base);
  return `${baseParsed.origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options = {}) {
  let lastError;
  for (let attempt = 1; attempt <= FETCH_RETRIES; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);
      return res;
    } catch (error) {
      clearTimeout(timer);
      lastError = error;
      if (attempt < FETCH_RETRIES) {
        await wait(250 * attempt);
      }
    }
  }
  throw lastError;
}

async function fetchSitemapUrls(base) {
  const sitemapUrl = `${base}/sitemap.xml`;
  const res = await fetchWithRetry(sitemapUrl, { redirect: 'follow' });
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

function isAssetUrl(url) {
  const clean = url.split('?', 1)[0].split('#', 1)[0];
  return ASSET_EXT_RE.test(clean);
}

async function checkUrl(url) {
  try {
    const res = await fetchWithRetry(url, { redirect: 'follow' });
    const ct = (res.headers.get('content-type') || '').toLowerCase();
    const okStatus = res.ok;
    const okType = !isAssetUrl(url) || !ct.includes('text/html');
    return { url, ok: okStatus && okType, status: res.status, contentType: ct };
  } catch (error) {
    return { url, ok: false, status: 0, contentType: String(error) };
  }
}

async function main() {
  const base = normalizeBase(BASE_URL);
  let sitemapUrls = [];

  if (!isLocalBase(base)) {
    console.error(`fatal: local-only check-live refuses non-local URL: ${base}`);
    process.exit(1);
  }

  try {
    sitemapUrls = (await fetchSitemapUrls(base)).map((url) => mapUrlToBase(url, base));
  } catch (error) {
    console.error(`warn: sitemap fetch failed; continuing with critical URLs only (${error.message})`);
  }
  const criticalUrls = CRITICAL_URLS.map((p) => `${base}${p}`);
  const urls = [...new Set([...sitemapUrls, ...criticalUrls])];

  const failures = [];
  for (const url of urls) {
    const result = await checkUrl(url);
    if (!result.ok) {
      failures.push(result);
    }
  }

  console.log(`base_url=${base}`);
  console.log(`checked_total=${urls.length}`);
  console.log(`checked_sitemap=${sitemapUrls.length}`);
  console.log(`checked_critical=${criticalUrls.length}`);
  console.log(`failures=${failures.length}`);

  for (const f of failures.slice(0, 80)) {
    console.log(`${f.status}\t${f.contentType}\t${f.url}`);
  }

  process.exit(failures.length > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(`fatal: ${error.message}`);
  process.exit(1);
});
