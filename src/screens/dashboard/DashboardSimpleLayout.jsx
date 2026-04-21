import { Outlet } from 'react-router-dom'
import './dashboardSimpleLayout.css'

export function DashboardSimpleLayout() {
  return (
    <div className="dashSimpleShell">
      <header className="dashSimpleHeader">
        <div className="dashSimpleBrand">
          <div className="dashSimpleDots" aria-hidden="true">
            <span className="d1" />
            <span className="d2" />
            <span className="d3" />
            <span className="d4" />
          </div>
          <span className="dashSimpleTitle">Dashboard</span>
        </div>
      </header>
      <main className="dashSimpleMain">
        <Outlet />
      </main>
    </div>
  )
}
