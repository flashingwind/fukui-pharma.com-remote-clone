function safeDecodePathname(pathname) {
  try {
    return decodeURIComponent(pathname)
  } catch {
    return pathname
  }
}

function redirectTo(url, pathname) {
  const redirectUrl = new URL(url.toString())
  redirectUrl.pathname = pathname
  return Response.redirect(redirectUrl.toString(), 301)
}

export async function onRequest(context) {
  const url = new URL(context.request.url)
  const decodedPathname = safeDecodePathname(url.pathname)
  const legacyMatch = decodedPathname.match(/^(.+?)\.(htm|html)$/i)

  if (!legacyMatch) {
    return context.next()
  }

  const nextPath = legacyMatch[1] || '/'
  return redirectTo(url, nextPath)
}
