import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getSessionInfo } from '../../lib/authStorage'
import { getPersonaById } from '../../services/personas'
import './dashboardPlaceholder.css'

export function DashboardPage({ title }) {
  const location = useLocation()
  const session = useMemo(() => getSessionInfo(), [location.key])
  const personaId = session?.personaId ?? session?.PersonaId ?? null
  const rol = String(session?.rol ?? session?.Rol ?? '').trim()
  const [correoCuenta, setCorreoCuenta] = useState(null)
  const [correoLoading, setCorreoLoading] = useState(() => personaId != null && personaId !== '')
  const [correoError, setCorreoError] = useState(null)

  useEffect(() => {
    setCorreoError(null)
    if (personaId == null || personaId === '') {
      setCorreoCuenta(null)
      setCorreoLoading(false)
      return
    }
    const ac = new AbortController()
    async function run() {
      try {
        setCorreoLoading(true)
        const p = await getPersonaById(personaId, { signal: ac.signal })
        const mail = String(p?.cuentaUsuario?.correoElectronico ?? p?.CuentaUsuario?.CorreoElectronico ?? '').trim()
        setCorreoCuenta(mail || null)
      } catch (e) {
        if (!ac.signal.aborted) {
          setCorreoCuenta(null)
          setCorreoError(String(e?.message ?? e ?? 'No se pudo obtener el correo de la cuenta.'))
        }
      } finally {
        if (!ac.signal.aborted) setCorreoLoading(false)
      }
    }
    run()
    return () => ac.abort()
  }, [personaId, location.key])

  const correoMostrado = correoLoading ? 'Cargando…' : correoCuenta || '—'

  return (
    <div className="dashCard">
      <div className="dashCardTitle">{title ?? 'Panel'}</div>
      <div className="dashCardText">
        Bienvenido/a. Desde el menú lateral podés navegar las secciones del sistema.
      </div>

      <div className="dashCardText" style={{ marginBottom: 10 }}>
        <div>
          <span style={{ fontWeight: 700, color: '#2c2c2a' }}>Rol:</span>{' '}
          <span>{rol || '—'}</span>
        </div>
        <div style={{ marginTop: 6 }}>
          <span style={{ fontWeight: 700, color: '#2c2c2a' }}>Correo (cuenta usuario):</span>{' '}
          <span>{correoMostrado}</span>
        </div>
        {correoError ? (
          <div className="dashCardText" style={{ marginTop: 8, marginBottom: 0, color: '#b42318', fontWeight: 600 }}>
            {correoError}
          </div>
        ) : null}
      </div>

      <div className="dashCardActions">
        <Link className="dashCardLink" to="/dashboard/roles">
          Ir a gestión de roles
        </Link>
        <Link className="dashCardLink" to="/dashboard/alumnos">
          Ir a alumnos
        </Link>
      </div>

      {!session ? (
        <div className="dashCardText" style={{ marginTop: 14, marginBottom: 0 }}>
          No encontramos datos de sesión en localStorage. Si acabás de iniciar sesión, probá recargar la página.
        </div>
      ) : null}
    </div>
  )
}

