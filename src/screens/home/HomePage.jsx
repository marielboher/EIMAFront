import { useEffect, useState } from 'react'
import { http } from '../../lib/http'

export function HomePage() {
  const [health, setHealth] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function run() {
      try {
        // Ajustá el endpoint a tu API .NET (ej: /health, /api/health, etc.)
        const res = await http.get('/health')
        if (!cancelled) setHealth(res.data)
      } catch (e) {
        if (!cancelled) setError(e)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>EIMA</h1>
      <p>Base frontend lista para consumir una API .NET.</p>

      <section style={{ marginTop: 16 }}>
        <h2>Health check</h2>
        {error ? (
          <pre style={{ whiteSpace: 'pre-wrap' }}>
            {String(error?.message ?? error)}
          </pre>
        ) : (
          <pre style={{ whiteSpace: 'pre-wrap' }}>
            {health ? JSON.stringify(health, null, 2) : 'Consultando...'}
          </pre>
        )}
      </section>
    </main>
  )
}

