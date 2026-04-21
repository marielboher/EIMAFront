import { Link, useLocation } from 'react-router-dom'
import { clearSession, getSessionInfo } from '../lib/authStorage'
import { logoutUser } from '../services/auth'
import './AppNav.css'

export function AppNav() {
  const location = useLocation()
  const session = getSessionInfo()
  const rol = String(session?.rol ?? '').toLowerCase()
  const isAuthed = Boolean(session)
  const isSuperAdmin = rol === 'super_admin'
  const accountHref = isAuthed ? '/perfil' : '/login'
  const accountActive =
    (!isAuthed && location.pathname === '/login') || (isAuthed && location.pathname === '/perfil')

  async function onLogout() {
    const ok = window.confirm('¿Seguro que querés cerrar sesión?')
    if (!ok) return
    try {
      await logoutUser()
    } finally {
      clearSession()
      window.location.href = '/login'
    }
  }

  return (
    <header className="appNav">
      <div className="appNavInner">
        <Link className="appNavBrand" to="/">
          <span className="appNavDots" aria-hidden="true">
            <span className="d1" />
            <span className="d2" />
            <span className="d3" />
            <span className="d4" />
          </span>
          <span className="appNavTitle">EIMA</span>
        </Link>

        <nav className="appNavLinks" aria-label="Principal">
          <Link className={location.pathname === '/' ? 'active' : ''} to="/">
            Inicio
          </Link>

          <Link className={location.pathname === '/contacto' ? 'active' : ''} to="/contacto">
            Contacto
          </Link>

          <Link
            className={`appNavIcon ${accountActive ? 'active' : ''}`}
            to={accountHref}
            aria-label={isAuthed ? 'Ir a perfil' : 'Ir a login'}
            title={isAuthed ? 'Perfil' : 'Iniciar sesión'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.33 0-8 2.17-8 5v1h16v-1c0-2.83-3.67-5-8-5Z"
              />
            </svg>
          </Link>

          {isAuthed ? (
            <Link
              className={location.pathname.startsWith('/dashboard') ? 'active' : ''}
              to={isSuperAdmin ? '/dashboard/roles' : '/dashboard'}
            >
              Dashboard
            </Link>
          ) : null}

          {isAuthed ? (
            <button type="button" className="appNavLogout" onClick={onLogout}>
              Salir
            </button>
          ) : null}
        </nav>
      </div>
    </header>
  )
}
