import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getSessionInfo } from '../../lib/authStorage'
import { fetchMiPerfil } from '../../services/personas'
import './profilePage.css'

function etiquetaRol(rol) {
  const r = String(rol ?? '').toLowerCase()
  const map = {
    super_admin: 'Super administrador',
    alumno: 'Alumno',
    profesor: 'Profesor',
    secretaria: 'Secretaría',
  }
  return map[r] ?? rol ?? '—'
}

function texto(v) {
  if (v == null) return '—'
  const s = String(v).trim()
  return s.length ? s : '—'
}

export function ProfilePage() {
  const location = useLocation()
  const session = useMemo(() => getSessionInfo(), [location.key])

  const [perfil, setPerfil] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!session) {
      setPerfil(null)
      setCargando(false)
      setError(null)
      return
    }
    const ac = new AbortController()
    let cancelado = false
    setCargando(true)
    setError(null)
    ;(async () => {
      try {
        const data = await fetchMiPerfil({ signal: ac.signal })
        if (!cancelado) setPerfil(data)
      } catch (e) {
        if (ac.signal.aborted || cancelado) return
        setPerfil(null)
        setError('No se pudieron cargar tus datos. Intentá de nuevo más tarde.')
      } finally {
        if (!cancelado) setCargando(false)
      }
    })()
    return () => {
      cancelado = true
      ac.abort()
    }
  }, [session])

  return (
    <div className="profileShell">
      <main className="profileMain">
        <article className="profileCard" aria-labelledby="perfil-titulo">
          <div className="profileCardInner">
            <div className="profileBrand">
              <div className="dots" aria-hidden="true">
                <span style={{ background: '#D7263D' }} />
                <span style={{ background: '#F4A024' }} />
                <span style={{ background: '#1B9E77' }} />
                <span style={{ background: '#2B6CB0' }} />
              </div>
              <span className="profileBrandName">EIMA</span>
            </div>

            <p className="profileEyebrow">Tu cuenta</p>
            <h1 id="perfil-titulo" className="profileTitle">
              Perfil
            </h1>
            <p className="profileLead">Datos registrados en el sistema asociados a tu cuenta.</p>

            {cargando ? <p className="profileEmpty">Cargando datos…</p> : null}
            {error ? <div className="alert">{error}</div> : null}

            {!session ? (
              <p className="profileEmpty">
                No hay una sesión activa en este navegador. Iniciá sesión para ver tu perfil.
              </p>
            ) : null}

            {session && !cargando && !error && perfil ? (
              <>
                <h2 className="profileSectionTitle">Datos personales</h2>
                <dl className="profileDl">
                  <div className="profileRow">
                    <dt className="profileDt">Nombre</dt>
                    <dd className="profileDd">{texto(perfil.nombre ?? perfil.Nombre)}</dd>
                  </div>
                  <div className="profileRow">
                    <dt className="profileDt">Apellido</dt>
                    <dd className="profileDd">{texto(perfil.apellido ?? perfil.Apellido)}</dd>
                  </div>
                  <div className="profileRow">
                    <dt className="profileDt">DNI</dt>
                    <dd className="profileDd profileDdMono">{texto(perfil.dni ?? perfil.Dni)}</dd>
                  </div>
                  <div className="profileRow">
                    <dt className="profileDt">Correo electrónico</dt>
                    <dd className="profileDd">{texto(perfil.correoElectronico ?? perfil.CorreoElectronico)}</dd>
                  </div>
                  <div className="profileRow">
                    <dt className="profileDt">Teléfono</dt>
                    <dd className="profileDd">{texto(perfil.telefono ?? perfil.Telefono)}</dd>
                  </div>
                  <div className="profileRow">
                    <dt className="profileDt">Dirección</dt>
                    <dd className="profileDd">{texto(perfil.direccion ?? perfil.Direccion)}</dd>
                  </div>
                  <div className="profileRow">
                    <dt className="profileDt">Rol</dt>
                    <dd className="profileDd">
                      <span className="profilePill">
                        {etiquetaRol(perfil.rol ?? perfil.Rol)}
                      </span>
                      {perfil.rol && etiquetaRol(perfil.rol ?? perfil.Rol) !== String(perfil.rol ?? perfil.Rol) ? (
                        <span className="profileDdMono" style={{ marginLeft: 8, opacity: 0.75 }}>
                          ({String(perfil.rol ?? perfil.Rol)})
                        </span>
                      ) : null}
                    </dd>
                  </div>
                </dl>
              </>
            ) : null}

            <footer className="profileFoot">
              <Link to="/">← Volver al inicio</Link>
              {!session ? (
                <>
                  {' · '}
                  <Link to="/login">Ir a iniciar sesión</Link>
                </>
              ) : null}
            </footer>
          </div>
        </article>
      </main>
    </div>
  )
}
