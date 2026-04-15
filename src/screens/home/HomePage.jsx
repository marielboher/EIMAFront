import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <main style={{ padding: 32, textAlign: 'left' }}>
      <h1 style={{ margin: '0 0 8px' }}>EIMA</h1>
      <p style={{ margin: 0, color: '#6b6b68' }}>
        Bienvenido. Iniciá sesión para acceder a tu dashboard.
      </p>

      <div style={{ display: 'flex', gap: 12, marginTop: 18, flexWrap: 'wrap' }}>
        <Link
          to="/login"
          style={{
            background: '#2B6CB0',
            color: '#fff',
            padding: '10px 14px',
            borderRadius: 10,
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          Ir a login
        </Link>
        <Link
          to="/registro"
          style={{
            background: 'rgba(43, 108, 176, 0.12)',
            color: '#2B6CB0',
            padding: '10px 14px',
            borderRadius: 10,
            textDecoration: 'none',
            fontWeight: 600,
            border: '1px solid rgba(43, 108, 176, 0.35)',
          }}
        >
          Crear cuenta
        </Link>
      </div>
    </main>
  )
}

