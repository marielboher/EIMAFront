import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import './dashboardLayout.css'

/** Contenedor del dashboard para super_admin (barra lateral + área principal). */
export function DashboardSuperShell({ children }) {
  const location = useLocation()
  const [navOpen, setNavOpen] = useState(false)

  useEffect(() => {
    setNavOpen(false)
  }, [location.pathname])

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') setNavOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className="dashShell">
      <aside className={`dashSidebar${navOpen ? ' isOpen' : ''}`} aria-label="Secciones del panel">
        <div className="dashSidebarTop">
          <div className="dashSidebarBrand">
            <div className="dashDots" aria-hidden="true">
              <span className="d1" />
              <span className="d2" />
              <span className="d3" />
              <span className="d4" />
            </div>
            <div className="dashSidebarTitle">Dashboard</div>
          </div>

          <button
            type="button"
            className="dashNavToggle"
            aria-label={navOpen ? 'Cerrar menú del panel' : 'Abrir menú del panel'}
            aria-expanded={navOpen ? 'true' : 'false'}
            aria-controls="dash-nav-panel"
            onClick={() => setNavOpen((v) => !v)}
          >
            <span className="dashNavToggleIcon" aria-hidden="true">
              {navOpen ? '✕' : '☰'}
            </span>
          </button>
        </div>

        <nav id="dash-nav-panel" className={`dashNav${navOpen ? ' isOpen' : ''}`}>
          <NavLink className={({ isActive }) => `dashNavLink${isActive ? ' active' : ''}`} to="/dashboard/personas">
            Directorio (ABM)
          </NavLink>
          <NavLink className={({ isActive }) => `dashNavLink${isActive ? ' active' : ''}`} to="/dashboard/roles">
            Gestión de roles
          </NavLink>
          <NavLink className={({ isActive }) => `dashNavLink${isActive ? ' active' : ''}`} to="/dashboard/alumnos">
            Alumnos
          </NavLink>
          <NavLink className={({ isActive }) => `dashNavLink${isActive ? ' active' : ''}`} to="/dashboard/profesores">
            Profesores
          </NavLink>
          <NavLink className={({ isActive }) => `dashNavLink${isActive ? ' active' : ''}`} to="/dashboard/colaboradores">
            Colaboradores
          </NavLink>
          <NavLink className={({ isActive }) => `dashNavLink${isActive ? ' active' : ''}`} to="/dashboard/inscripciones">
            Inscripciones
          </NavLink>
          <NavLink className={({ isActive }) => `dashNavLink${isActive ? ' active' : ''}`} to="/dashboard/materias">
            Materias
          </NavLink>
        </nav>
      </aside>

      <section className="dashMain">{children}</section>
    </div>
  )
}

/** Uso aislado con Outlet (p. ej. rutas anidadas). */
export function DashboardLayout() {
  return (
    <DashboardSuperShell>
      <Outlet />
    </DashboardSuperShell>
  )
}
