/**
 * Decap CMS GitHub OAuth — step 2
 * GET /callback  →  exchange code, postMessage token to opener
 *
 * Env: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
 */
function htmlPage(scriptBody) {
  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <title>GitHub 로그인</title>
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        font-family: system-ui, sans-serif;
        background: #f4f7f2;
        color: #14231c;
      }
    </style>
  </head>
  <body>
    <p>GitHub 로그인 처리 중…</p>
    <script>${scriptBody}</script>
  </body>
</html>`
}

export async function onRequestGet(context) {
  const { env, request } = context
  const clientId = env.GITHUB_CLIENT_ID
  const clientSecret = env.GITHUB_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return new Response(
      htmlPage(
        `document.body.innerHTML = '<p>OAuth 환경변수(GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET)가 없습니다.</p>'`,
      ),
      { status: 500, headers: { 'content-type': 'text/html; charset=utf-8' } },
    )
  }

  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const error = url.searchParams.get('error')
  const cookie = request.headers.get('Cookie') || ''
  const expected = cookie.match(/decap_oauth_state=([^;]+)/)?.[1]

  if (error) {
    const msg = JSON.stringify(`authorization:github:error:${error}`)
    return new Response(
      htmlPage(`
        (function () {
          const msg = ${msg};
          if (window.opener) { window.opener.postMessage(msg, '*'); window.close(); }
          else { document.body.textContent = msg; }
        })();
      `),
      { headers: { 'content-type': 'text/html; charset=utf-8' } },
    )
  }

  if (!code || !state || !expected || state !== expected) {
    return new Response(
      htmlPage(`document.body.textContent = 'OAuth state 검증 실패. 다시 로그인해 주세요.';`),
      { status: 400, headers: { 'content-type': 'text/html; charset=utf-8' } },
    )
  }

  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: `${url.origin}/callback`,
    }),
  })

  const tokenJson = await tokenRes.json()
  if (!tokenRes.ok || !tokenJson.access_token) {
    const detail = tokenJson.error_description || tokenJson.error || 'token exchange failed'
    const msg = JSON.stringify(`authorization:github:error:${detail}`)
    return new Response(
      htmlPage(`
        (function () {
          const msg = ${msg};
          if (window.opener) { window.opener.postMessage(msg, '*'); window.close(); }
          else { document.body.textContent = msg; }
        })();
      `),
      { status: 400, headers: { 'content-type': 'text/html; charset=utf-8' } },
    )
  }

  const payload = JSON.stringify({
    token: tokenJson.access_token,
    provider: 'github',
  })

  return new Response(
    htmlPage(`
      (function () {
        const msg = 'authorization:github:success:' + ${JSON.stringify(payload)};
        const origins = [window.location.origin, '*'];
        if (window.opener) {
          window.opener.postMessage(msg, window.location.origin);
          window.close();
        } else {
          document.body.textContent = '로그인 완료. 이 창을 닫고 관리자 페이지로 돌아가 주세요.';
        }
      })();
    `),
    {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'Set-Cookie':
          'decap_oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
      },
    },
  )
}
