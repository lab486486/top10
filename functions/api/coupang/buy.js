/**
 * Coupang Partners buy redirect
 * GET /api/coupang/buy?brand=...&species=dog|cat
 *   → search best product → 302 to affiliate product URL
 *
 * Cloudflare Pages env (Production + redeploy):
 *   COUPANG_ACCESS_KEY, COUPANG_SECRET_KEY
 *   optional: COUPANG_SUB_ID
 */
import {
  COUPANG_API_HOST,
  COUPANG_DEEPLINK_PATH,
  COUPANG_SEARCH_PATH,
  coupangAuthorization,
  readCoupangCreds,
} from './_hmac.js'

function fallbackSearchUrl(brand, species) {
  const kind = species === 'cat' ? '고양이 사료' : '강아지 사료'
  const q = brand ? `${brand} ${kind}` : kind
  return `https://www.coupang.com/np/search?q=${encodeURIComponent(q)}`
}

function pickProductUrl(payload) {
  const data = payload?.data
  const list = Array.isArray(data) ? data : data?.productData || data?.products || []
  if (!Array.isArray(list) || list.length === 0) return ''

  const first = list[0] || {}
  return (
    first.productUrl ||
    first.product_url ||
    first.url ||
    first.landingUrl ||
    first.landing_url ||
    ''
  )
}

async function searchProduct(keyword, accessKey, secretKey, subId) {
  const qs = new URLSearchParams({
    keyword,
    limit: '1',
    subId,
  })
  const pathAndQuery = `${COUPANG_SEARCH_PATH}?${qs.toString()}`
  const authorization = await coupangAuthorization('GET', pathAndQuery, accessKey, secretKey)

  const res = await fetch(`${COUPANG_API_HOST}${pathAndQuery}`, {
    method: 'GET',
    headers: {
      Authorization: authorization,
      'Content-Type': 'application/json;charset=UTF-8',
    },
  })

  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(json?.message || json?.rMessage || `search ${res.status}`)
    err.status = res.status
    err.body = json
    throw err
  }
  return pickProductUrl(json)
}

async function toDeeplink(coupangUrl, accessKey, secretKey, subId) {
  const authorization = await coupangAuthorization(
    'POST',
    COUPANG_DEEPLINK_PATH,
    accessKey,
    secretKey,
  )
  const res = await fetch(`${COUPANG_API_HOST}${COUPANG_DEEPLINK_PATH}`, {
    method: 'POST',
    headers: {
      Authorization: authorization,
      'Content-Type': 'application/json;charset=UTF-8',
    },
    body: JSON.stringify({
      coupangUrls: [coupangUrl],
      subId,
    }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) return ''

  const rows = json?.data
  if (!Array.isArray(rows) || !rows[0]) return ''
  return rows[0].shortenUrl || rows[0].landingUrl || rows[0].url || ''
}

export async function onRequestGet(context) {
  const { env, request } = context
  const { accessKey, secretKey, subId } = readCoupangCreds(env)
  const url = new URL(request.url)
  const brand = (url.searchParams.get('brand') || '').trim()
  const species = url.searchParams.get('species') === 'cat' ? 'cat' : 'dog'
  const explicitQ = (url.searchParams.get('q') || '').trim()
  const debug = url.searchParams.get('debug') === '1'

  const keyword =
    explicitQ ||
    (brand
      ? `${brand} ${species === 'cat' ? '고양이' : '강아지'} 사료`
      : species === 'cat'
        ? '고양이 사료'
        : '강아지 사료')

  const plainFallback = fallbackSearchUrl(brand, species)

  if (!accessKey || !secretKey) {
    if (debug) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'missing COUPANG_ACCESS_KEY / COUPANG_SECRET_KEY on this deploy',
          fallback: plainFallback,
        }),
        { status: 500, headers: { 'content-type': 'application/json; charset=utf-8' } },
      )
    }
    return Response.redirect(plainFallback, 302)
  }

  try {
    // Cache affiliate target briefly to stay under rate limits
    const cache = caches.default
    const cacheUrl = new URL(request.url)
    cacheUrl.searchParams.delete('debug')
    cacheUrl.searchParams.set('v', '1')
    const cacheReq = new Request(cacheUrl.toString(), { method: 'GET' })
    const cached = await cache.match(cacheReq)
    if (cached && !debug) return cached

    let target = await searchProduct(keyword, accessKey, secretKey, subId)

    // If search returned a plain coupang URL, wrap via deeplink when needed
    if (target && !/link\.coupang\.com|coupa\.ng|partner/i.test(target)) {
      const deep = await toDeeplink(target, accessKey, secretKey, subId)
      if (deep) target = deep
    }

    if (!target) {
      const deepSearch = await toDeeplink(plainFallback, accessKey, secretKey, subId)
      target = deepSearch || plainFallback
    }

    if (debug) {
      return new Response(
        JSON.stringify({ ok: true, keyword, target }, null, 2),
        { headers: { 'content-type': 'application/json; charset=utf-8' } },
      )
    }

    const out = new Response(null, {
      status: 302,
      headers: {
        Location: target,
        'Cache-Control': 'public, max-age=900',
      },
    })
    context.waitUntil(cache.put(cacheReq, out.clone()))
    return out
  } catch (e) {
    if (debug) {
      return new Response(
        JSON.stringify({
          ok: false,
          keyword,
          error: String(e?.message || e),
          body: e?.body || null,
          fallback: plainFallback,
        }),
        { status: 502, headers: { 'content-type': 'application/json; charset=utf-8' } },
      )
    }
    return Response.redirect(plainFallback, 302)
  }
}
