const CONTENT_DIRS = [
  'nutrient-foods',
  'vitamins',
  'minerals',
  'flowers',
  'travel',
  'others',
  'publication',
  'shop',
  'access',
]
const NUTRIENT_FOOD_SLUGS = new Set([
  'eiyouso', 'ganyuute',
  'aganyuu', 'eganyuu', 'dganyuu', 'bkganyuu', 'cganyuu', 'b1ganyuu', 'b2ganyuu', 'b3ganyuu',
  'b5ganyuu', 'b6ganyuu', 'b12ganyu', 'yousanga', 'biotinga',
  'carugany', 'magganyu', 'karigany', 'aenganyu', 'tetugany', 'douganyu', 'cromugan', 'mangagan',
  'yo-dogan', 'serengan', 'moribuga', 'vanagany', 'senigany', 'keisogan', 'housogan', 'gerumaga',
  'coqganyu', 'colingan', 'inosigan',
])
const NUTRI_INFO_SLUGS = new Set([
  'eiyou', 'vitasi2', 'vitasi3', 'vitasi4', 'serensir', 'magsiryou', 'aensiryou', 'tetusiryou', 'shyoyou', 'lipoicacid',
])
const LEGACY_EXACT_REDIRECTS = {
  '/index.html': '/',
  '/index2.html': '/',
  '/atopic/': '/atopic',
  '/order.html': '/shop/tyuumon',
  '/skincare.html': '/others/hadautukusisa',
  '/books/mokuzito.html': '/vitamins/mokuzito',
  '/books/mokuzitu.html': '/vitamins/mokuzitu',
  '/freeradical/kousanka.html': '/vitamins/kousanka',
  '/oldcar/oldcar.html': '/others/oldcar',
  '/supliments/': '/shop/tyuumon',
  '/supliments/be-tagur.html': '/shop/tyuumon',
  '/supliments/be-tagur10.html': '/shop/tyuumon',
  '/supliments/begu.html': '/shop/tyuumon',
}

function redirectTo(url, pathname) {
  const redirectUrl = new URL(url.toString())
  redirectUrl.pathname = pathname
  return Response.redirect(redirectUrl.toString(), 301)
}

function buildCandidatePaths(slug) {
  const contentSlug = slug === 'access' ? 'index' : slug
  return CONTENT_DIRS.map((dir) => `/content/${dir}/${contentSlug}.md`)
}

function buildSectionCandidatePath(slug) {
  const sectionMatch = slug.match(/^([^/]+)\/([^/]+)$/)
  if (!sectionMatch) {
    return null
  }
  const [, section, pageSlug] = sectionMatch
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

  // This rule is requested for the production apex domain only.
  if (url.hostname !== 'fukui-pharma.com') {
    return context.next()
  }

  const exactRedirect = LEGACY_EXACT_REDIRECTS[url.pathname]
  if (exactRedirect) {
    return redirectTo(url, exactRedirect)
  }

  const oldNutriMatch = url.pathname.match(/^\/nutri\/([^/]+)\.(htm|html)$/i)
  if (oldNutriMatch) {
    const slug = oldNutriMatch[1].toLowerCase()
    if (NUTRIENT_FOOD_SLUGS.has(slug)) {
      return redirectTo(url, `/nutrient-foods/${slug}`)
    }
    if (NUTRI_INFO_SLUGS.has(slug)) {
      if (slug === 'aensiryou' || slug === 'magsiryou' || slug === 'tetusiryou') {
        return redirectTo(url, `/minerals/${slug}`)
      }
      return redirectTo(url, `/vitamins/${slug}`)
    }
  }

  const oldHawaiiMatch = url.pathname.match(/^\/hawaii\/([^/]+)\.(htm|html)$/i)
  if (oldHawaiiMatch) {
    const slug = oldHawaiiMatch[1].toLowerCase()
    return redirectTo(url, `/travel/${slug}`)
  }

  const oldFlowersMatch = url.pathname.match(/^\/flowers\/([^/]+)\.(htm|html)$/i)
  if (oldFlowersMatch) {
    const slug = oldFlowersMatch[1]
    return redirectTo(url, `/flowers/${slug}`)
  }

  const normalized = url.pathname.replace(/^\/+|\/+$/g, '').replace(/\.(htm|html)$/i, '')
  const parts = normalized.split('/').filter(Boolean)
  if (
    parts.length === 2 &&
    (parts[0] === 'vitamins' || parts[0] === 'minerals') &&
    NUTRIENT_FOOD_SLUGS.has(parts[1])
  ) {
    const redirectUrl = new URL(url.toString())
    redirectUrl.pathname = `/nutrient-foods/${parts[1]}`
    return Response.redirect(redirectUrl.toString(), 301)
  }

  const match = url.pathname.match(/^\/(.+)\.(htm|html)$/i)
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
