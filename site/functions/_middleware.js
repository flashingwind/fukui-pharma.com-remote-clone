import {
  CANONICAL_CONTENT_SECTIONS,
  getCanonicalPathFromAlias,
} from '../shared/canonical-routing.js'

const CONTENT_DIRS = [...CANONICAL_CONTENT_SECTIONS]
const LEGACY_EXACT_REDIRECTS = {
  '/order.html': '/shop/tyuumon',
  '/books/mokuzito.html': '/vitamin-mineral/mokuzito',
  '/books/mokuzitu.html': '/vitamin-mineral/mokuzitu',
  '/freeradical/kousanka.html': '/active-oxygen/kousanka',
  '/oldcar/oldcar.html': '/others/oldcar',
  '/supliments/': '/supplement/suppuse',
  '/suppliments/': '/supplement/suppuse',
  '/suppliments/masdevallia': '/flowers/masdevallia',
}

function redirectTo(url, pathname) {
  const redirectUrl = new URL(url.toString())
  redirectUrl.pathname = pathname
  return Response.redirect(redirectUrl.toString(), 301)
}

function safeDecodePathname(pathname) {
  try {
    return decodeURIComponent(pathname)
  } catch {
    return pathname
  }
}

function buildCandidatePaths(slug) {
  const contentSlug = slug === 'access' ? 'index' : slug
  return CONTENT_DIRS.map((dir) => `/content/${dir}/${contentSlug}.md`)
}

async function sectionExistsForSlug(section, slug, requestUrl, env) {
  const contentSlug = slug === 'access' ? 'index' : slug
  const candidatePath = `/content/${section}/${contentSlug}.md`
  const candidateUrl = new URL(candidatePath, requestUrl)
  const response = await env.ASSETS.fetch(new Request(candidateUrl.toString(), { method: 'HEAD' }))
  return response.status === 200
}

async function findCanonicalSectionForSlug(slug, requestUrl, env) {
  for (const section of CANONICAL_CONTENT_SECTIONS) {
    // eslint-disable-next-line no-await-in-loop
    if (await sectionExistsForSlug(section, slug, requestUrl, env)) {
      return section
    }
  }
  return null
}

function buildSectionCandidatePath(slug) {
  const sectionMatch = slug.match(/^([^/]+)\/([^/]+)$/)
  if (!sectionMatch) {
    return null
  }
  let [, section, pageSlug] = sectionMatch
  if (section === VITAMIN_MINERAL_URL_SECTION) {
    section = 'vitamin-mineral'
  }
  if (!CONTENT_DIRS.includes(section)) {
    return null
  }
  const contentSlug = pageSlug === 'access' ? 'index' : pageSlug
  return `/content/${section}/${contentSlug}.md`
}

async function contentExistsForSlug(slug, requestUrl, env) {
  if (slug === '' || slug === 'index' || slug === 'index2') {
    return true
  }

  const sectionCandidate = buildSectionCandidatePath(slug)
  if (sectionCandidate) {
    const sectionUrl = new URL(sectionCandidate, requestUrl)
    const sectionResponse = await env.ASSETS.fetch(new Request(sectionUrl.toString(), { method: 'HEAD' }))
    if (sectionResponse.status === 200) {
      return true
    }
  }

  for (const candidate of buildCandidatePaths(slug)) {
    const url = new URL(candidate, requestUrl)
    const response = await env.ASSETS.fetch(new Request(url.toString(), { method: 'HEAD' }))
    if (response.status === 200) {
      return true
    }
  }

  return false
}

export async function onRequest(context) {
  const url = new URL(context.request.url)
  const decodedPathname = safeDecodePathname(url.pathname)
  const canonicalHost = 'fukui-pharma.com'

  // Keep apex as the single canonical host for search engines.
  if (url.hostname === 'www.fukui-pharma.com') {
    const redirectUrl = new URL(url.toString())
    redirectUrl.hostname = canonicalHost
    return Response.redirect(redirectUrl.toString(), 301)
  }

  if (url.hostname !== canonicalHost) {
    return context.next()
  }

  if (/^\/suplement(\/|$)/i.test(decodedPathname)) {
    return new Response('Not Found', { status: 404 })
  }

  const exactRedirect = LEGACY_EXACT_REDIRECTS[url.pathname]
  if (exactRedirect) {
    return redirectTo(url, exactRedirect)
  }

  const oldHawaiiMatch = decodedPathname.match(/^\/hawaii\/([^/]+)\.(htm|html)$/i)
  if (oldHawaiiMatch) {
    const slug = oldHawaiiMatch[1].toLowerCase()
    return redirectTo(url, `/travel/${slug}`)
  }

  const oldFlowersMatch = decodedPathname.match(/^\/flowers\/([^/]+)\.(htm|html)$/i)
  if (oldFlowersMatch) {
    const slug = oldFlowersMatch[1]
    return redirectTo(url, `/flowers/${slug}`)
  }

  const normalized = decodedPathname.replace(/^\/+|\/+$/g, '').replace(/\.(htm|html)$/i, '')
  const parts = normalized.split('/').filter(Boolean)
  const canonicalPath = getCanonicalPathFromAlias(parts)
  const currentPath = decodedPathname.replace(/\/+$/g, '') || '/'
  if (canonicalPath && canonicalPath !== currentPath) {
    return redirectTo(url, canonicalPath)
  }

  if (parts.length === 1) {
    const [slug] = parts
    const canonicalSection = await findCanonicalSectionForSlug(slug, url, context.env)
    if (canonicalSection) {
      const nextPath = `/${canonicalSection}/${slug}`
      if (nextPath !== currentPath) {
        return redirectTo(url, nextPath)
      }
    }
  }

  if (parts.length === 2 && CONTENT_DIRS.includes(parts[0])) {
    const [section, slug] = parts
    const canonicalSection = await findCanonicalSectionForSlug(slug, url, context.env)
    if (canonicalSection && canonicalSection !== section) {
      return redirectTo(url, `/${canonicalSection}/${slug}`)
    }
  }

  const match = decodedPathname.match(/^\/(.+)\.(htm|html)$/i)
  if (!match) {
    return context.next()
  }

  const slug = match[1].toLowerCase()
  const canonical = `/${slug}`

  if (await contentExistsForSlug(slug, url, context.env)) {
    const redirectUrl = new URL(url.toString())
    redirectUrl.pathname = canonical
    return Response.redirect(redirectUrl.toString(), 301)
  }

  return new Response('Not Found', { status: 404 })
}
