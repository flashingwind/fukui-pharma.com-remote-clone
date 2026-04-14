import fs from 'fs';
import path from 'path';
const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, 'content');
const PUBLIC_DIR = path.join(ROOT, 'public');
const CONTENT_DIRS = ['vitamin-mineral', 'supplement', 'active-oxygen', 'atopic', 'flowers', 'travel', 'others', 'publication', 'shop', 'access'];

const ASSET_EXT_RE = /\.(gif|jpe?g|png|webp|svg|ico|css|js|xml|txt|pdf|woff2?|ttf|eot|mp4|webm)$/i;
const IMAGE_EXT_RE = /\.(gif|jpe?g|png|webp|svg)$/i;
const PAGE_EXT_RE = /\.(md|htm|html)$/i;
const COMMON_FALLBACK_DIRS = ['/flowers', '/travel', '/vitamin-mineral', '/supplement', '/active-oxygen', '/atopic', '/others', '/legacy', '/shop', '/access', '/publication', ''];

function walk(dir, exts) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full, exts));
      continue;
    }
    if (exts.some((ext) => full.endsWith(ext))) {
      out.push(full);
    }
  }
  return out;
}

function extractRefs(text) {
  const refs = [];
  const mdRe = /(!?)\[[^\]]*\]\(([^)]+)\)/g;
  const htmlRe = /\b(href|src)\s*=\s*['\"]([^'\"]+)['\"]/gi;

  let m;
  while ((m = mdRe.exec(text)) !== null) {
    refs.push({
      ref: m[2].trim(),
      source: m[1] === '!' ? 'md-image' : 'md-link',
    });
  }
  while ((m = htmlRe.exec(text)) !== null) {
    refs.push({
      ref: m[2].trim(),
      source: m[1].toLowerCase() === 'src' ? 'html-src' : 'html-href',
    });
  }
  return refs;
}

function isExternal(ref) {
  return /^(https?:|mailto:|javascript:|#|data:)/i.test(ref);
}

function stripQueryHash(ref) {
  return ref.split('#', 1)[0].split('?', 1)[0];
}

function resolveRelativeRoutePath(filePath, routePath) {
  const relFromContent = path.relative(CONTENT_DIR, filePath).replace(/\\/g, '/');
  const relFromPublic = path.relative(PUBLIC_DIR, filePath).replace(/\\/g, '/');
  const baseDir = relFromContent && !relFromContent.startsWith('..')
    ? path.posix.dirname('/' + relFromContent.replace(/\.md$/i, ''))
    : path.posix.dirname('/' + relFromPublic.replace(/\.(htm|html)$/i, ''));
  const cleaned = routePath.replace(/^\.\/+/, '').replace(/^\/+/, '');
  const joined = path.posix.join(baseDir, cleaned);
  return joined.startsWith('/') ? joined : `/${joined}`;
}

function routeExists(routePath) {
  const raw = routePath.replace(/^\/+|\/+$/g, '').replace(/\.(htm|html)$/i, '');
  if (!raw || raw === 'index' || raw === 'index2') {
    return fs.existsSync(path.join(CONTENT_DIR, 'index.md'));
  }

  const segments = raw.split('/').filter(Boolean);
  const section = segments.length > 1 && CONTENT_DIRS.includes(segments[0]) ? segments[0] : null;
  if (!section) {
    return false;
  }

  const contentPath = path.join(CONTENT_DIR, `${raw}.md`);
  return fs.existsSync(contentPath);
}

function checkRef(filePath, ref) {
  const bare = stripQueryHash(ref);
  if (!bare) return null;

  if (bare.startsWith('/')) {
    if (ASSET_EXT_RE.test(bare)) {
      const publicAsset = path.join(PUBLIC_DIR, bare.replace(/^\//, ''));
      if (!fs.existsSync(publicAsset)) {
        return { type: 'asset', ref };
      }
      return null;
    }

    const publicFile = path.join(PUBLIC_DIR, bare.replace(/^\//, ''));
    if (fs.existsSync(publicFile)) return null;

    if (!routeExists(bare)) {
      return { type: 'route', ref };
    }
    return null;
  }

  const resolved = path.resolve(path.dirname(filePath), bare);
  if (ASSET_EXT_RE.test(bare)) {
    if (fs.existsSync(resolved)) return null;

    const relFromContent = path.relative(CONTENT_DIR, filePath).replace(/\\/g, '/');
    const mdDir = path.posix.dirname('/' + relFromContent.replace(/\.md$/i, ''));
    const runtimeDirs = [mdDir, ...COMMON_FALLBACK_DIRS];
    const uniqueDirs = [...new Set(runtimeDirs)];

    const found = uniqueDirs.some((dir) => {
      const normalizedDir = dir === '' ? '' : dir.replace(/^\/+/, '');
      const candidate = path.join(PUBLIC_DIR, normalizedDir, bare).replace(/\\/g, '/');
      return fs.existsSync(candidate);
    });

    if (!found) {
      return { type: 'asset', ref };
    }
    return null;
  }

  if (PAGE_EXT_RE.test(bare)) {
    if (!fs.existsSync(resolved)) {
      const rawRoute = bare.replace(PAGE_EXT_RE, '');
      const resolvedRoute = resolveRelativeRoutePath(filePath, rawRoute);
      if (!routeExists(resolvedRoute)) {
        return { type: 'route', ref };
      }
    }
    return null;
  }

  if (!fs.existsSync(resolved)) {
    const resolvedRoute = resolveRelativeRoutePath(filePath, bare);
    if (!routeExists(resolvedRoute)) {
      return { type: 'route', ref };
    }
  }

  return null;
}

function checkRenderRisk(refInfo) {
  const ref = refInfo?.ref || '';
  const source = refInfo?.source || '';
  const bare = stripQueryHash(ref);
  if (!bare) return null;
  if (isExternal(bare)) return null;

  // Image URLs referenced as links are often non-rendering mistakes (e.g. [new!](/icon/new.gif)).
  if (IMAGE_EXT_RE.test(bare) && (source === 'md-link' || source === 'html-href')) {
    return { type: 'render', ref, source };
  }

  return null;
}

function main() {
  const files = [
    ...walk(CONTENT_DIR, ['.md']),
    ...walk(PUBLIC_DIR, ['.htm', '.html']),
  ];

  const issues = [];
  for (const filePath of files) {
    const text = fs.readFileSync(filePath, 'utf8');
    for (const refInfo of extractRefs(text)) {
      const ref = refInfo?.ref || '';
      if (!ref || isExternal(ref)) continue;

      const renderIssue = checkRenderRisk(refInfo);
      if (renderIssue) {
        issues.push({
          file: path.relative(ROOT, filePath),
          ...renderIssue,
        });
      }

      const issue = checkRef(filePath, ref);
      if (issue) {
        issues.push({
          file: path.relative(ROOT, filePath),
          ...issue,
        });
      }
    }
  }

  const assetIssues = issues.filter((x) => x.type === 'asset');
  const routeIssues = issues.filter((x) => x.type === 'route');
  const renderIssues = issues.filter((x) => x.type === 'render');

  console.log(`checked_files=${files.length}`);
  console.log(`issues_total=${issues.length}`);
  console.log(`issues_asset=${assetIssues.length}`);
  console.log(`issues_route=${routeIssues.length}`);
  console.log(`issues_render=${renderIssues.length}`);

  for (const issue of issues.slice(0, 120)) {
    const suffix = issue.source ? ` [${issue.source}]` : '';
    console.log(`${issue.type.toUpperCase()} ${issue.file} :: ${issue.ref}${suffix}`);
  }

  process.exit(issues.length > 0 ? 1 : 0);
}

main();
