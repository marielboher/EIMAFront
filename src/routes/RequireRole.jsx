import { Navigate, useLocation } from 'react-router-dom'
import { getSessionInfo } from '../lib/authStorage'

export function RequireRole({ role, children }) {
  const location = useLocation()
  const session = getSessionInfo()
  const currentRole = String(session?.rol ?? '').toLowerCase()

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (role && currentRole !== String(role).toLowerCase()) {
    return <Navigate to="/403" replace />
  }

  return children
}

