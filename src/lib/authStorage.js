import { readJwtExpUtc } from './jwt'

const ACCESS_TOKEN_KEY = 'eima_access_token'
const ACCESS_TOKEN_EXP_MS_KEY = 'eima_access_token_exp_ms'
const SESSION_KEY = 'eima_session'

function storageForToken() {
  return window.localStorage
}

export function getAccessToken() {
  const expMsRaw = storageForToken().getItem(ACCESS_TOKEN_EXP_MS_KEY)
  const expMs = expMsRaw ? Number(expMsRaw) : null
  if (expMs && Number.isFinite(expMs) && Date.now() >= expMs) {
    clearAccessToken()
    return null
  }
  return storageForToken().getItem(ACCESS_TOKEN_KEY)
}

/**
 * Persiste el access token en localStorage con expiración.
 * Preferir `expiraEnUtc` del backend; si no viene, usa `exp` del JWT.
 */
export function setAccessToken(token, { expiraEnUtc } = {}) {
  if (!token) return

  let expMs = null
  if (expiraEnUtc) {
    const d = new Date(expiraEnUtc)
    if (!Number.isNaN(d.getTime())) expMs = d.getTime()
  }
  if (!expMs) {
    const fromJwt = readJwtExpUtc(token)
    if (fromJwt) expMs = fromJwt.getTime()
  }
  // Fallback conservador (24h) si no pudimos inferir expiración
  if (!expMs) expMs = Date.now() + 24 * 60 * 60 * 1000

  const s = storageForToken()
  s.setItem(ACCESS_TOKEN_KEY, token)
  s.setItem(ACCESS_TOKEN_EXP_MS_KEY, String(expMs))
}

export function clearAccessToken() {
  const s = storageForToken()
  s.removeItem(ACCESS_TOKEN_KEY)
  s.removeItem(ACCESS_TOKEN_EXP_MS_KEY)
}

export function setSessionInfo(info) {
  if (!info) return
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(info))
}

export function getSessionInfo() {
  const raw = window.localStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function clearSession() {
  clearAccessToken()
  window.localStorage.removeItem(SESSION_KEY)
}
