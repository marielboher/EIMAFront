import { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getSessionInfo, clearSession } from '../../lib/authStorage'
import { logoutUser } from '../../services/auth'

export function DashboardPage({ title }) {
  const location = useLocation()
  const session = useMemo(() => getSessionInfo(), [location.key])

  return (
    <main style={{ padding: 24, fontFamily: "'DM Sans', system-ui, sans-serif", textAlign: 'left' }}>
      <h1 style={{ margin: '0 0 8px' }}>{title ?? 'Dashboard'}</h1>
      <div style={{ color: '#6b6b68', marginBottom: 16 }}>
        Sesión: {session ? JSON.stringify(session, null, 2) : 'Sin sesión en sessionStorage.'}
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link to="/login">Volver a login</Link>
        <button
          type="button"
          onClick={async () => {
            const ok = window.confirm('¿Seguro que querés cerrar sesión?')
            if (!ok) return
            try {
              await logoutUser()
            } finally {
              clearSession()
              window.location.href = '/login'
            }
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </main>
  )
}

