import fs from 'node:fs';
import path from 'node:path';

export function listHtml(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? listHtml(file) : entry.name.endsWith('.html') ? [file] : [];
  });
}

// Use the canonical emitted by the page itself, including legacy aliases.
export function collectPages(dir, origin) {
  return listHtml(dir).flatMap(file => {
    const html = fs.readFileSync(file, 'utf8');
    const canonical = html.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1];
    if (!canonical || !file.endsWith(`${path.sep}index.html`)) return [];
    const pathname = '/' + path.relative(dir, file).split(path.sep).join('/').replace(/index\.html$/, '');
    const url = new URL(canonical);
    if (url.origin !== origin) throw new Error(`Unexpected canonical origin: ${canonical}`);
    return [{ file, pathname, canonical: url.pathname, noindex: /<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex/.test(html) }];
  });
}

export function buildRedirects(existing, pages) {
  const aliases = new Map(pages.filter(p => p.pathname !== p.canonical).map(p => [p.pathname, p.canonical]));
  const resolve = pathname => {
    const seen = new Set();
    while (aliases.has(pathname)) {
      if (seen.has(pathname)) throw new Error(`Canonical redirect cycle: ${pathname}`);
      seen.add(pathname);
      pathname = aliases.get(pathname);
    }
    return pathname;
  };
  const rules = new Map();
  for (const p of pages) {
    const target = resolve(p.canonical);
    if (p.pathname !== target) rules.set(p.pathname, target);
    if (p.pathname !== '/') rules.set(p.pathname.slice(0, -1), target);
  }
  for (const line of existing.split(/\r?\n/)) {
    if (!line.trim() || line.startsWith('#')) continue;
    const [source, destination] = line.trim().split(/\s+/);
    // Cloudflare already redirects /index.html to /. The reverse rule loops.
    if (source === '/' && destination === '/index.html') continue;
    if (rules.has(source)) continue;
    const target = resolve(destination);
    if (source === target) continue;
    rules.set(source, target);
  }
  for (const p of pages) {
    const target = resolve(p.canonical);
    if (!pages.some(page => page.pathname === target && page.canonical === target)) {
      throw new Error(`Missing canonical target: ${target}`);
    }
  }
  return '# Canonical redirects generated after build.\n' + [...rules].map(([source, target]) => `${source} ${target} 301`).join('\n') + '\n';
}

export function finalizeSeo(dir, origin = 'https://fukui-pharma.com') {
  const pages = collectPages(dir, origin);
  const canonicalByPath = new Map(pages.map(p => [p.pathname.replace(/\/$/, '') || '/', p.canonical]));
  // Normalize hrefs only: the author's text and images are left intact.
  for (const file of listHtml(dir)) {
    const html = fs.readFileSync(file, 'utf8');
    const updated = html.replace(/(<a\b[^>]*\bhref=")([^"<>]*)(")/g, (match, before, href, after) => {
      if (!href.startsWith('/') && !href.startsWith(origin + '/')) return match;
      const url = new URL(href, origin);
      if (url.origin !== origin) return match;
      const canonical = canonicalByPath.get(url.pathname.replace(/\/$/, '') || '/');
      return canonical ? before + canonical + url.search + url.hash + after : match;
    });
    if (updated !== html) fs.writeFileSync(file, updated);
  }
  const urls = pages.filter(p => p.pathname === p.canonical && !p.noindex).map(p => origin + p.canonical).sort();
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.map(url => `  <url><loc>${url}</loc></url>`).join('\n') + '\n</urlset>\n';
  // Keep the older sitemap URL usable, with the same canonical-only contents.
  fs.writeFileSync(path.join(dir, 'sitemap.xml'), xml);
  fs.writeFileSync(path.join(dir, 'sitemap-0.xml'), xml);
  fs.writeFileSync(path.join(dir, '_redirects'), buildRedirects(fs.readFileSync(path.join(dir, '_redirects'), 'utf8'), pages));
  console.log(`SEO: ${urls.length} canonical sitemap URLs; ${pages.filter(p => p.pathname !== p.canonical).length} aliases redirected.`);
}
