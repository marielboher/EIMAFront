import { NavLink, Outlet } from 'react-router-dom'
import './dashboardLayout.css'

export function DashboardLayout() {
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
          <div className="dashSidebarTitle">Panel</div>
        </div>

        <nav className="dashNav">
          <NavLink className={({ isActive }) => `dashNavLink${isActive ? ' active' : ''}`} end to="/dashboard">
            Inicio
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
          <NavLink className={({ isActive }) => `dashNavLink${isActive ? ' active' : ''}`} to="/dashboard/secretaria">
            Secretaría
          </NavLink>
          <NavLink className={({ isActive }) => `dashNavLink${isActive ? ' active' : ''}`} to="/dashboard/materias">
            Materias
          </NavLink>
        </nav>
      </aside>

      <section className="dashMain">
        <Outlet />
      </section>
    </div>
  )
}
