import { Navigate } from 'react-router-dom'
import { getSessionInfo } from '../../lib/authStorage'
import './dashboardSimpleLayout.css'

export function DashboardIndex() {
  const session = getSessionInfo()
  const isSuperAdmin = String(session?.rol ?? '').toLowerCase() === 'super_admin'
  if (isSuperAdmin) return <Navigate to="/dashboard/roles" replace />

  return (
    <article className="dashWelcomeCard" aria-labelledby="dash-bienvenida-titulo">
      <h1 id="dash-bienvenida-titulo" className="dashWelcomeTitle">
        ¡Bienvenido!
      </h1>
      <p className="dashWelcomeText">
        Estás en tu panel de EIMA. Desde aquí podrás acceder a más funciones cuando estén disponibles para tu perfil.
      </p>
      <p className="dashWelcomeHint">
        Usá el menú superior para ir al inicio, al contacto o a tu perfil.
      </p>
    </article>
  )
}

export function DashboardCatchAll() {
  const session = getSessionInfo()
  const isSuperAdmin = String(session?.rol ?? '').toLowerCase() === 'super_admin'
  return <Navigate to={isSuperAdmin ? '/dashboard/roles' : '/dashboard'} replace />
}
