import { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getSessionInfo } from '../../lib/authStorage'
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

export function ProfilePage() {
  const location = useLocation()
  const session = useMemo(() => getSessionInfo(), [location.key])

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
            <p className="profileLead">
              Resumen de tu sesión. Más adelante podremos mostrar aquí tus datos personales desde el servidor.
            </p>

            {session ? (
              <>
                <h2 className="profileSectionTitle">Sesión actual</h2>
                <dl className="profileDl">
                  <div className="profileRow">
                    <dt className="profileDt">Rol</dt>
                    <dd className="profileDd">
                      <span className="profilePill">{etiquetaRol(session.rol)}</span>
                      {session.rol && etiquetaRol(session.rol) !== session.rol ? (
                        <span className="profileDdMono" style={{ marginLeft: 8, opacity: 0.75 }}>
                          ({String(session.rol)})
                        </span>
                      ) : null}
                    </dd>
                  </div>
                </dl>
              </>
            ) : (
              <p className="profileEmpty">
                No hay una sesión activa en este navegador. Iniciá sesión para ver tu perfil.
              </p>
            )}

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
