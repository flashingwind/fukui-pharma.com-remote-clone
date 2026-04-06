const CONTENT_DIRS = [
  'vitamin-mineral',
  'flowers',
  'travel',
  'others',
  'publication',
  'shop',
  'access',
]
const VITAMIN_MINERAL_URL_SECTION = 'vitamin-mineral'
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
const VITAMIN_MINERAL_OTHER_SLUGS = new Set(['mokuzito', 'mokuzitu', 'kousanka', 'suppuse'])
const VITAMIN_MINERAL_SLUGS = new Set([
  ...NUTRIENT_FOOD_SLUGS,
  ...NUTRI_INFO_SLUGS,
  ...VITAMIN_MINERAL_OTHER_SLUGS,
])
const LEGACY_EXACT_REDIRECTS = {
  '/index.html': '/',
  '/index2.html': '/',
  '/atopic/': '/atopic',
  '/order.html': '/shop/tyuumon',
  '/skincare.html': '/others/hadautukusisa',
  '/books/mokuzito.html': '/vitamin-mineral/mokuzito',
  '/books/mokuzitu.html': '/vitamin-mineral/mokuzitu',
  '/freeradical/kousanka.html': '/vitamin-mineral/kousanka',
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

  // This rule is requested for the production apex domain only.
  if (url.hostname !== 'fukui-pharma.com') {
    return context.next()
  }

  const exactRedirect = LEGACY_EXACT_REDIRECTS[url.pathname]
  if (exactRedirect) {
    return redirectTo(url, exactRedirect)
  }

  const oldNutriMatch = decodedPathname.match(/^\/nutri\/([^/]+)\.(htm|html)$/i)
  if (oldNutriMatch) {
    const slug = oldNutriMatch[1].toLowerCase()
    if (VITAMIN_MINERAL_SLUGS.has(slug)) {
      return redirectTo(url, `/${VITAMIN_MINERAL_URL_SECTION}/${slug}`)
    }
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
  if (parts.length === 1 && VITAMIN_MINERAL_SLUGS.has(parts[0])) {
    return redirectTo(url, `/${VITAMIN_MINERAL_URL_SECTION}/${parts[0]}`)
  }
  if (
    parts.length === 2 &&
    (parts[0] === 'vitamins' || parts[0] === 'minerals' || parts[0] === 'nutrient-foods') &&
    VITAMIN_MINERAL_SLUGS.has(parts[1])
  ) {
    return redirectTo(url, `/${VITAMIN_MINERAL_URL_SECTION}/${parts[1]}`)
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
