/**
 * Coupang Partners OpenAPI — HMAC-SHA256 Authorization header
 * Docs: partners.coupang.com Open API
 */

export function readCoupangCreds(env) {
  const accessKey =
    env.COUPANG_ACCESS_KEY ||
    env.COUPANG_ACCESSKEY ||
    env.COUPANG_API_ACCESS_KEY ||
    ''
  const secretKey =
    env.COUPANG_SECRET_KEY ||
    env.COUPANG_SECRETKEY ||
    env.COUPANG_API_SECRET_KEY ||
    ''
  const subId = env.COUPANG_SUB_ID || env.COUPANG_SUBID || 'petfood'
  return { accessKey, secretKey, subId }
}

function pad2(n) {
  return String(n).padStart(2, '0')
}

/** GMT+0 timestamp: yyMMddTHHmmssZ */
export function coupangSignedDate(date = new Date()) {
  return (
    String(date.getUTCFullYear()).slice(2) +
    pad2(date.getUTCMonth() + 1) +
    pad2(date.getUTCDate()) +
    'T' +
    pad2(date.getUTCHours()) +
    pad2(date.getUTCMinutes()) +
    pad2(date.getUTCSeconds()) +
    'Z'
  )
}

function toHex(buf) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * @param {string} method GET|POST
 * @param {string} pathAndQuery e.g. /v2/.../products/search?keyword=...
 */
export async function coupangAuthorization(method, pathAndQuery, accessKey, secretKey) {
  const datetime = coupangSignedDate()
  const qIdx = pathAndQuery.indexOf('?')
  const path = qIdx === -1 ? pathAndQuery : pathAndQuery.slice(0, qIdx)
  const query = qIdx === -1 ? '' : pathAndQuery.slice(qIdx + 1)
  const message = datetime + method.toUpperCase() + path + query

  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secretKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = toHex(await crypto.subtle.sign('HMAC', key, enc.encode(message)))

  return `CEA algorithm=HmacSHA256, access-key=${accessKey}, signed-date=${datetime}, signature=${signature}`
}

export const COUPANG_API_HOST = 'https://api-gateway.coupang.com'
export const COUPANG_SEARCH_PATH =
  '/v2/providers/affiliate_open_api/apis/openapi/v1/products/search'
export const COUPANG_DEEPLINK_PATH =
  '/v2/providers/affiliate_open_api/apis/openapi/v1/deeplink'
