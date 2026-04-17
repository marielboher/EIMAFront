import { Navigate, useLocation } from 'react-router-dom'
import { clearSession, getAccessToken, getSessionInfo } from '../lib/authStorage'

export function RequireAuth({ children }) {
  const location = useLocation()
  const session = getSessionInfo()
  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  const almacenamiento = String(session?.almacenamientoToken ?? '').toLowerCase()
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

  return children
}
