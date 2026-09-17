/** Legacy path → /api/oauth/auth */
export async function onRequestGet(context) {
  const url = new URL(context.request.url)
  url.pathname = '/api/oauth/auth'
  url.search = context.request.url.includes('?')
    ? new URL(context.request.url).search
    : url.search
  // preserve provider query
  const incoming = new URL(context.request.url)
  url.search = incoming.search
  return Response.redirect(url.toString(), 302)
}
