const ACCESS_TOKEN_KEY = 'eima_access_token'
const SESSION_KEY = 'eima_session'

export function getAccessToken() {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setAccessToken(token) {
  if (!token) return
  sessionStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export function clearAccessToken() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY)
}

export function setSessionInfo(info) {
  if (!info) return
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(info))
}

export function getSessionInfo() {
  const raw = sessionStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function clearSession() {
  clearAccessToken()
  sessionStorage.removeItem(SESSION_KEY)
}

