import { Navigate, useLocation } from 'react-router-dom'
import { clearSession, getAccessToken, getSessionInfo } from '../lib/authStorage'

export function RequireRole({ role, children, redirectTo }) {
  const location = useLocation()
  const session = getSessionInfo()
  const currentRole = String(session?.rol ?? '').toLowerCase()
  const almacenamiento = String(session?.almacenamientoToken ?? '').toLowerCase()

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  // Si el login fue en modo Bearer, validamos expiración local del token.
  if (almacenamiento === 'bearer' || almacenamiento === '') {
    const token = getAccessToken()
    if (!token) {
      clearSession()
      return <Navigate to="/login" replace state={{ from: location.pathname }} />
    }
  }

  const expira = session?.expiraEnUtc ? new Date(session.expiraEnUtc) : null
  if (expira && !Number.isNaN(expira.getTime()) && Date.now() >= expira.getTime()) {
    clearSession()
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (role && currentRole !== String(role).toLowerCase()) {
    return <Navigate to={redirectTo ?? '/403'} replace />
  }

  return children
}

