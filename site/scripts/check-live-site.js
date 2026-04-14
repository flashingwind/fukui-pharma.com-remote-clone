const BASE_URL = process.argv[2] || 'https://fukui-pharma.com';

const ASSET_EXT_RE = /\.(gif|jpe?g|png|webp|svg|ico|css|js|xml|txt|pdf|woff2?|ttf|eot|mp4|webm)$/i;

const CRITICAL_URLS = [
  '/icon/new.gif',
  '/suppliments/sinhon5.jpg',
  '/suppliments/megasin.gif',
  '/suppliments/betasin.gif',
  '/publication/sinhon5.jpg',
  '/others/megasin.gif',
  '/others/betasin.gif',
];

function normalizeBase(url) {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function mapUrlToBase(url, base) {
  const baseParsed = new URL(base);
  const parsed = new URL(url, base);
  return `${baseParsed.origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
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

function isAssetUrl(url) {
  const clean = url.split('?', 1)[0].split('#', 1)[0];
  return ASSET_EXT_RE.test(clean);
}

async function checkUrl(url) {
  try {
    const res = await fetch(url, { redirect: 'follow' });
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
  const sitemapUrls = (await fetchSitemapUrls(base)).map((url) => mapUrlToBase(url, base));
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
