import { NavLink, Outlet } from 'react-router-dom'
import './dashboardLayout.css'

/** Contenedor del dashboard para super_admin (barra lateral + área principal). */
export function DashboardSuperShell({ children }) {
  return (
    <div className="dashShell">
      <aside className="dashSidebar" aria-label="Secciones del panel">
        <div className="dashSidebarBrand">
          <div className="dashDots" aria-hidden="true">
            <span className="d1" />
            <span className="d2" />
            <span className="d3" />
            <span className="d4" />
          </div>
          <div className="dashSidebarTitle">Dashboard</div>
        </div>

        <nav className="dashNav">
          <NavLink className={({ isActive }) => `dashNavLink${isActive ? ' active' : ''}`} to="/dashboard/roles">
            Gestión de roles
          </NavLink>
          <NavLink className={({ isActive }) => `dashNavLink${isActive ? ' active' : ''}`} to="/dashboard/alumnos">
            Alumnos
          </NavLink>
          <NavLink className={({ isActive }) => `dashNavLink${isActive ? ' active' : ''}`} to="/dashboard/profesores">
            Profesores
          </NavLink>
          <NavLink className={({ isActive }) => `dashNavLink${isActive ? ' active' : ''}`} to="/dashboard/secretaria">
            Secretaría
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
