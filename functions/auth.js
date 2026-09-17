/**
 * Decap CMS GitHub OAuth — step 1
 * GET /auth  →  GitHub authorize redirect
 *
 * Cloudflare Pages env:
 *   GITHUB_CLIENT_ID
 *   GITHUB_CLIENT_SECRET (used in /callback)
 */
export async function onRequestGet(context) {
  const { env, request } = context
  const clientId = env.GITHUB_CLIENT_ID
  if (!clientId) {
    return new Response(
      [
        'GITHUB_CLIENT_ID 환경변수가 없습니다.',
        '',
        'Cloudflare Pages → Settings → Environment variables 에',
        'GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET 을 넣고 재배포하세요.',
        'GitHub OAuth App callback URL 예:',
        `${new URL(request.url).origin}/callback`,
      ].join('\n'),
      { status: 500, headers: { 'content-type': 'text/plain; charset=utf-8' } },
    )
  }

  const url = new URL(request.url)
  const origin = url.origin
  const provider = url.searchParams.get('provider') || 'github'
  if (provider !== 'github') {
    return new Response(`Unsupported provider: ${provider}`, { status: 400 })
  }

  const state = crypto.randomUUID()
  const authorize = new URL('https://github.com/login/oauth/authorize')
  authorize.searchParams.set('client_id', clientId)
  authorize.searchParams.set('scope', 'repo user')
  authorize.searchParams.set('redirect_uri', `${origin}/callback`)
  authorize.searchParams.set('state', state)

  const headers = new Headers({ Location: authorize.toString() })
  headers.append(
    'Set-Cookie',
    `decap_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
  )

  return new Response(null, { status: 302, headers })
}
