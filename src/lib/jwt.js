function base64UrlToJson(payloadB64Url) {
  const b64 = payloadB64Url.replace(/-/g, '+').replace(/_/g, '/')
  const padded = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), '=')
  const json = atob(padded)
  return JSON.parse(json)
}

export function readJwtExpUtc(token) {
  try {
    const parts = String(token).split('.')
    if (parts.length < 2) return null
    const payload = base64UrlToJson(parts[1])
    const expSec = payload?.exp
    if (typeof expSec !== 'number') return null
    return new Date(expSec * 1000)
  } catch {
    return null
  }
}
