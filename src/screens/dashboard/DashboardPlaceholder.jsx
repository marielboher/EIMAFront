import { Link } from 'react-router-dom'
import './dashboardPlaceholder.css'

export function DashboardPlaceholder({ title, description }) {
  return (
    <div className="dashCard">
      <div className="dashCardTitle">{title}</div>
      <div className="dashCardText">{description}</div>
      <div className="dashCardActions">
        <Link className="dashCardLink" to="/dashboard">
          Volver al inicio del panel
        </Link>
      </div>
    </div>
  )
}
