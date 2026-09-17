/** Legacy path → /api/oauth/auth */
export async function onRequestGet() {
  return Response.redirect('/api/oauth/auth', 302)
}
