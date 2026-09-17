/** Legacy path → /api/oauth/callback */
export async function onRequestGet(context) {
  const url = new URL(context.request.url)
  url.pathname = '/api/oauth/callback'
  return Response.redirect(url.toString(), 302)
}
