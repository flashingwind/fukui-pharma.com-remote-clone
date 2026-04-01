const CONTENT_DIRS = [
  'vitamins',
  'minerals',
  'flowers',
  'travel',
  'others',
  'publication',
  'shop',
  'access',
]

function buildCandidatePaths(slug) {
  const contentSlug = slug === 'access' ? 'index' : slug
  return CONTENT_DIRS.map((dir) => `/content/${dir}/${contentSlug}.md`)
}

async function contentExistsForSlug(slug, requestUrl, env) {
  if (slug === '' || slug === 'index' || slug === 'index2') {
    return true
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
