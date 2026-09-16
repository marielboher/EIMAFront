import { Link, Navigate } from 'react-router-dom'
import { getSessionInfo } from '../../lib/authStorage'
import { PersonasDashboard } from '../admin/personas/PersonasDashboard'
import './dashboardSimpleLayout.css'

export function DashboardIndex() {
  const session = getSessionInfo()
  const isSuperAdmin = String(session?.rol ?? '').toLowerCase() === 'super_admin'
  const nombre = String(session?.nombre ?? session?.Nombre ?? '').trim()

  return (
    <div className="dashboardIndexContainer">
      <article className="dashWelcomeCard" aria-labelledby="dash-bienvenida-titulo" style={{ marginBottom: isSuperAdmin ? '20px' : '0' }}>
        <h1 id="dash-bienvenida-titulo" className="dashWelcomeTitle">
          {nombre ? `¡Bienvenido/a, ${nombre}!` : '¡Bienvenido/a!'}
        </h1>
        <p className="dashWelcomeText">
          Estás en tu panel de EIMA. Desde aquí podés acceder a las secciones del sistema.
        </p>
        {isSuperAdmin ? (
          <>
            <p className="dashWelcomeHint">
              Como super administrador, tenés acceso a la gestión de roles y a los listados desde el menú lateral.
            </p>
          </>
        ) : (
          <p className="dashWelcomeHint">Usá el menú para ir al inicio, al contacto o a tu perfil.</p>
        )}
      </article>

      {isSuperAdmin && (
        <div className="dashboardEmbeddedSection">
          <PersonasDashboard />
        </div>
      )}
    </div>
  )
}

export function DashboardCatchAll() {
  return <Navigate to="/dashboard" replace />
}
