import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { clearSession, getSessionInfo } from '../lib/authStorage'
import { logoutUser } from '../services/auth'
import { getPreferredTheme, toggleTheme } from '../lib/theme'
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
  const [theme, setTheme] = useState(() => document?.documentElement?.dataset?.theme ?? getPreferredTheme())
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
    setMobileMenuOpen(false)
    setAccountMenuOpen(false)
  }, [location.pathname, location.hash])

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false)
        setAccountMenuOpen(false)
      }
    }
    function onDocClick(e) {
      const t = e.target
      if (!(t instanceof Element)) return
      if (t.closest('.appNavMenu') || t.closest('.appNavAccount')) return
      setMobileMenuOpen(false)
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
      window.location.href = '/login'
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
          <div className="appNavMenu">
            <button
              type="button"
              className="appNavMenuBtn"
              aria-label="Abrir menú"
              aria-expanded={mobileMenuOpen ? 'true' : 'false'}
              onClick={() => setMobileMenuOpen((v) => !v)}
            >
              ☰
            </button>
            {mobileMenuOpen ? (
              <div className="appNavDropdown" role="menu" aria-label="Menú">
                <Link
                  className={location.pathname === '/' && !location.hash ? 'active' : ''}
                  to="/"
                  role="menuitem"
                >
                  Inicio
                </Link>
                <Link
                  className={location.pathname === '/' && location.hash === '#contacto' ? 'active' : ''}
                  to="/#contacto"
                  role="menuitem"
                >
                  Contacto
                </Link>
              </div>
            ) : null}
          </div>

          <Link className={`appNavTopLink ${location.pathname === '/' && !location.hash ? 'active' : ''}`} to="/">
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
