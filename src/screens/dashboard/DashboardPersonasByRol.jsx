import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPersonas } from '../../services/personas'
import './dashboardPersonasByRol.css'

export function DashboardPersonasByRol({ title, rolNombre }) {
  const rolKey = String(rolNombre ?? '').toLowerCase()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [people, setPeople] = useState([])

  useEffect(() => {
    const ac = new AbortController()
    async function run() {
      setError(null)
      setLoading(true)
      try {
        const res = await getPersonas({ rol: rolKey, limite: 1000, signal: ac.signal })
        const list = Array.isArray(res?.datos) ? res.datos : []
        setPeople(list)
      } catch (e) {
        if (!ac.signal.aborted) {
          setPeople([])
          setError(String(e?.message ?? e ?? 'No se pudo cargar el listado.'))
        }
      } finally {
        if (!ac.signal.aborted) setLoading(false)
      }
    }
    run()
    return () => ac.abort()
  }, [rolKey])

  return (
    <div className="dashPersonas">
      <div className="dashPersonasHeader">
        <h1 className="dashPersonasTitle">{title}</h1>
        <Link className="dashPersonasBack" to="/dashboard">
          Inicio del panel
        </Link>
      </div>

      {loading ? <div className="dashPersonasMsg">Cargando…</div> : null}
      {error ? <div className="dashPersonasErr">{error}</div> : null}

      {!loading && !error && people.length === 0 ? (
        <div className="dashPersonasMsg">No hay personas con este rol.</div>
      ) : null}

      {!loading && people.length > 0 ? (
        <ul className="dashPersonasList" aria-label={`Listado de ${title}`}>
          {people.map((p) => {
            const nombre = `${p?.nombre ?? ''} ${p?.apellido ?? ''}`.trim() || '—'
            const correo = String(p?.cuentaUsuario?.correoElectronico ?? '').trim() || '(sin cuenta / correo)'
            const dni = String(p?.dni ?? p?.Dni ?? '').trim() || '—'
            return (
              <li key={p?.id ?? p?.Id ?? nombre} className="dashPersonasRow">
                <div className="dashPersonasMain">
                  <div className="dashPersonasName">{nombre}</div>
                  <div className="dashPersonasMeta">
                    DNI: {dni} · {correo}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
