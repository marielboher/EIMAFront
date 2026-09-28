import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { clearSession, getSessionInfo } from '../lib/authStorage'
import { logoutUser } from '../services/auth'
import { getPreferredTheme, toggleTheme } from '../lib/theme'
import './AppNav.css'

export function AppNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const session = getSessionInfo()
  const isAuthed = Boolean(session)
  const accountHref = isAuthed ? '/perfil' : '/login'
  const accountActive =
    (!isAuthed && location.pathname === '/login') || (isAuthed && location.pathname === '/perfil')
  const homeActive = location.pathname === '/' && !location.hash
  const [theme, setTheme] = useState(() => document?.documentElement?.dataset?.theme ?? getPreferredTheme())
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)

  useEffect(() => {
    // Mantiene el estado en sync si el tema cambia por fuera (ej: script en index.html o localStorage).
    const current = document?.documentElement?.dataset?.theme ?? getPreferredTheme()
    setTheme(current === 'dark' ? 'dark' : 'light')

    function onStorage(e) {
      if (e.key !== 'theme') return
      const next = document?.documentElement?.dataset?.theme ?? getPreferredTheme()
      setTheme(next === 'dark' ? 'dark' : 'light')
    }

    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  useEffect(() => {
    setAccountMenuOpen(false)
  }, [location.pathname, location.hash])

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') setAccountMenuOpen(false)
    }
    function onDocClick(e) {
      const t = e.target
      if (!(t instanceof Element)) return
      if (t.closest('.appNavAccount')) return
      setAccountMenuOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('click', onDocClick)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('click', onDocClick)
    }
  }, [])

  async function onLogout() {
    const ok = window.confirm('¿Seguro que querés cerrar sesión?')
    if (!ok) return
    try {
      await logoutUser()
    } finally {
      clearSession()
      navigate('/login', { replace: true })
    }
  }

  function onToggleTheme() {
    const next = toggleTheme()
    setTheme(next)
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
          <Link
            className={`appNavHomeIcon ${homeActive ? 'active' : ''}`}
            to="/"
            aria-label="Ir al inicio"
            title="Inicio"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 3.2 3.5 10.2a1 1 0 0 0-.3.7V20a1 1 0 0 0 1 1h5.2a.8.8 0 0 0 .8-.8V15.5h3.6v4.7a.8.8 0 0 0 .8.8H19.8a1 1 0 0 0 1-1v-9.1a1 1 0 0 0-.3-.7L12 3.2Z"
              />
            </svg>
          </Link>

          <Link className={`appNavTopLink ${homeActive ? 'active' : ''}`} to="/">
            Inicio
          </Link>

          <Link
            className={`appNavTopLink ${location.pathname === '/' && location.hash === '#contacto' ? 'active' : ''}`}
            to="/#contacto"
          >
            Contacto
          </Link>

          <button
            type="button"
            className="appNavTheme"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
            title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          >
            <span className="appNavThemeIcon" aria-hidden="true">
              {theme === 'dark' ? '☀️' : '🌙'}
            </span>
          </button>

          {isAuthed ? (
            <div className="appNavAccount">
              <button
                type="button"
                className={`appNavIcon ${accountActive ? 'active' : ''}`}
                onClick={() => setAccountMenuOpen((v) => !v)}
                aria-label="Abrir menú de cuenta"
                aria-expanded={accountMenuOpen ? 'true' : 'false'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.33 0-8 2.17-8 5v1h16v-1c0-2.83-3.67-5-8-5Z"
                  />
                </svg>
              </button>
              {accountMenuOpen ? (
                <div className="appNavDropdown appNavDropdownRight" role="menu" aria-label="Cuenta">
                  <Link to="/perfil" role="menuitem">
                    Perfil
                  </Link>
                  <Link to="/dashboard" role="menuitem">
                    Dashboard
                  </Link>
                  <Link to="/#contacto" role="menuitem" className="appNavAccountMobileOnly">
                    Contacto
                  </Link>
                  <button type="button" className="appNavDropdownBtn" onClick={onLogout} role="menuitem">
                    Salir
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <Link
              className={`appNavIcon ${accountActive ? 'active' : ''}`}
              to={accountHref}
              aria-label="Ir a iniciar sesión"
              title="Iniciar sesión"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.33 0-8 2.17-8 5v1h16v-1c0-2.83-3.67-5-8-5Z"
                />
              </svg>
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
