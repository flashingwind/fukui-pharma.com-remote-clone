function safeDecodePathname(pathname) {
  try {
    return decodeURIComponent(pathname)
  } catch {
    return pathname
  }
}

function hasFileExtension(pathname) {
  const match = pathname.match(/\/[^/]+\.([^/]+)$/)
  if (!match) {
    return false
  }
  const ext = match[1].toLowerCase()
  // Treat legacy .html/.htm as markdown content routes instead of static file requests.
  return ext !== 'html' && ext !== 'htm'
}

function toContentMarkdownPath(pathname) {
  const rawPath = pathname.replace(/^\/+|\/+$/g, '')
  const normalizedPath = rawPath.replace(/\.(htm|html)$/i, '')
  if (!normalizedPath || normalizedPath === 'index' || normalizedPath === 'index2') {
    return '/content/index.md'
  }
  return `/content/${normalizedPath}.md`
}

async function assetExists(context, url, pathname) {
  const targetUrl = new URL(pathname, url)
  const req = new Request(targetUrl.toString(), {
    method: 'HEAD',
    headers: { 'x-route-check': '1' },
  })

  let res
  if (context.env?.ASSETS?.fetch) {
    res = await context.env.ASSETS.fetch(req)
  } else {
    res = await fetch(req)
  }
  return res.ok
}

async function fetchAsset(context, url, pathname, method = 'GET') {
  const targetUrl = new URL(pathname, url)
  const req = new Request(targetUrl.toString(), {
    method,
    headers: { 'x-route-check': '1' },
  })

  if (context.env?.ASSETS?.fetch) {
    return context.env.ASSETS.fetch(req)
  }
  return fetch(req)
}

export async function onRequest(context) {
  if (context.request.headers.get('x-route-check') === '1') {
    return context.next()
  }

  const method = context.request.method.toUpperCase()
  if (method !== 'GET' && method !== 'HEAD') {
    return context.next()
  }

  const url = new URL(context.request.url)
  const decodedPathname = safeDecodePathname(url.pathname)

  if (decodedPathname.startsWith('/content/')) {
    return context.next()
  }

  if (hasFileExtension(decodedPathname)) {
    const exists = await assetExists(context, url, decodedPathname)
    return exists ? context.next() : new Response('Not Found', { status: 404 })
  }

  const contentPath = toContentMarkdownPath(decodedPathname)
  const exists = await assetExists(context, url, contentPath)
  if (!exists) {
    return new Response('Not Found', { status: 404 })
  }

  return fetchAsset(context, url, '/index.html', method)
}
