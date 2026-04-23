import { Link } from 'react-router-dom'

export function ForbiddenPage() {
  return (
    <main style={{ padding: 32, textAlign: 'left' }}>
      <h1 style={{ margin: '0 0 8px' }}>403</h1>
      <p style={{ margin: 0, color: 'var(--muted-2)' }}>
        No tenés permisos para acceder a esta pantalla.
      </p>
      <div style={{ marginTop: 16 }}>
        <Link to="/login">Ir a login</Link>
      </div>
    </main>
  )
}

