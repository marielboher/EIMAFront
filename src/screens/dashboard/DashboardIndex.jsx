import { Link, Navigate } from 'react-router-dom'
import { getSessionInfo } from '../../lib/authStorage'
import './dashboardSimpleLayout.css'

export function DashboardIndex() {
  const session = getSessionInfo()
  const isSuperAdmin = String(session?.rol ?? '').toLowerCase() === 'super_admin'
  const nombre = String(session?.nombre ?? session?.Nombre ?? '').trim()

  return (
    <article className="dashWelcomeCard" aria-labelledby="dash-bienvenida-titulo">
      <h1 id="dash-bienvenida-titulo" className="dashWelcomeTitle">
        {nombre ? `¡Bienvenido/a, ${nombre}!` : '¡Bienvenido/a!'}
      </h1>
      <p className="dashWelcomeText">
        Estás en tu panel de EIMA. Desde aquí podés acceder a las secciones del sistema.
      </p>
      {isSuperAdmin ? (
        <>
          <p className="dashWelcomeHint">
            Como super administrador, tenés acceso a la gestión de roles y a los listados.
          </p>
          <div className="dashWelcomeActions" role="list">
            <Link className="dashWelcomeAction" to="/dashboard/roles" role="listitem">
              Roles
            </Link>
            <Link className="dashWelcomeAction" to="/dashboard/personas" role="listitem">
              Directorio (ABM)
            </Link>
            <Link className="dashWelcomeAction" to="/dashboard/alumnos" role="listitem">
              Alumnos
            </Link>
            <Link className="dashWelcomeAction" to="/dashboard/profesores" role="listitem">
              Profesores
            </Link>
            <Link className="dashWelcomeAction" to="/dashboard/secretaria" role="listitem">
              Secretaría
            </Link>
            <Link className="dashWelcomeAction" to="/dashboard/materias" role="listitem">
              Materias
            </Link>
          </div>
        </>
      ) : (
        <p className="dashWelcomeHint">Usá el menú para ir al inicio, al contacto o a tu perfil.</p>
      )}
    </article>
  )
}

export function DashboardCatchAll() {
  return <Navigate to="/dashboard" replace />
}
