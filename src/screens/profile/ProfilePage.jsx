import { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getSessionInfo } from '../../lib/authStorage'

export function ProfilePage() {
  const location = useLocation()
  const session = useMemo(() => getSessionInfo(), [location.key])

  return (
    <main style={{ padding: 24, textAlign: 'left' }}>
      <h1 style={{ margin: '0 0 8px' }}>Perfil</h1>
      <p style={{ margin: 0, color: '#6b6b68' }}>
        Datos de sesión actuales (placeholder hasta conectar con endpoints de perfil).
      </p>
      <pre style={{ marginTop: 16, background: '#fff', border: '1px solid #e0d8d0', borderRadius: 12, padding: 16 }}>
        {session ? JSON.stringify(session, null, 2) : 'Sin sesión'}
      </pre>
      <div style={{ marginTop: 16 }}>
        <Link to="/">Volver al inicio</Link>
      </div>
    </main>
  )
}
