/**
 * Decap CMS GitHub OAuth — step 1
 * GET /api/oauth/auth  →  GitHub authorize redirect
 *
 * Cloudflare Pages (프로젝트명: petfood) Settings → Environment variables
 *   Production: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
 * ※ 변수 저장 후 반드시 새 배포가 돌아가야 Functions에 반영됩니다.
 *
 * GitHub OAuth App Authorization callback URL:
 *   https://petfood.pe.kr/api/oauth/callback
 */
function readGithubCreds(env) {
  const clientId =
    env.GITHUB_CLIENT_ID ||
    env.OAUTH_CLIENT_ID ||
    env.GITHUB_OAUTH_CLIENT_ID ||
    ''
  const clientSecret =
    env.GITHUB_CLIENT_SECRET ||
    env.OAUTH_CLIENT_SECRET ||
    env.GITHUB_OAUTH_CLIENT_SECRET ||
    ''
  return { clientId, clientSecret }
}

function envHint(env) {
  const keys = Object.keys(env || {})
    .filter((k) => k !== 'ASSETS')
    .sort()
  const githubish = keys.filter((k) => /github|oauth|client/i.test(k))
  return [
    `이 배포에서 보이는 런타임 키: ${keys.length ? keys.join(', ') : '(없음)'}`,
    `GitHub/OAUTH 관련 키: ${githubish.length ? githubish.join(', ') : '(없음)'}`,
    '',
    '확인 체크리스트:',
    '1) Cloudflare → Workers & Pages → petfood 프로젝트인지',
    '2) Settings → Environment variables → Production 에',
    '   GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET 이 있는지 (이름 대소문자 정확히)',
    '3) 변수 저장만으로는 부족 — Deployments 에서 Retry deployment 또는',
    '   main 에 커밋을 푸시해 새 배포를 돌려야 반영됩니다',
  ].join('\n')
}

export async function onRequestGet(context) {
  const { env, request } = context
  const { clientId } = readGithubCreds(env)
  const origin = new URL(request.url).origin
  const callbackUrl = `${origin}/api/oauth/callback`

  if (!clientId) {
    return new Response(
      [
        'GITHUB_CLIENT_ID 환경변수가 이 배포에 없습니다.',
        '',
        envHint(env),
        '',
        `Callback URL 예: ${callbackUrl}`,
      ].join('\n'),
      { status: 500, headers: { 'content-type': 'text/plain; charset=utf-8' } },
    )
  }

  const url = new URL(request.url)
  const provider = url.searchParams.get('provider') || 'github'
  if (provider !== 'github') {
    return new Response(`Unsupported provider: ${provider}`, { status: 400 })
  }

  const state = crypto.randomUUID()
  const authorize = new URL('https://github.com/login/oauth/authorize')
  authorize.searchParams.set('client_id', clientId)
  authorize.searchParams.set('scope', 'repo user')
  authorize.searchParams.set('redirect_uri', callbackUrl)
  authorize.searchParams.set('state', state)

  const headers = new Headers({ Location: authorize.toString() })
  headers.append(
    'Set-Cookie',
    `decap_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
  )

  return new Response(null, { status: 302, headers })
}
