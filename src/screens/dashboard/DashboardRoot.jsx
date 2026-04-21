import { Outlet } from 'react-router-dom'
import { getSessionInfo } from '../../lib/authStorage'
import { DashboardSuperShell } from './DashboardLayout.jsx'
import { DashboardSimpleLayout } from './DashboardSimpleLayout.jsx'

export function DashboardRoot() {
  const session = getSessionInfo()
  const isSuperAdmin = String(session?.rol ?? '').toLowerCase() === 'super_admin'
  if (isSuperAdmin) {
    return (
      <DashboardSuperShell>
        <Outlet />
      </DashboardSuperShell>
    )
  }
  return <DashboardSimpleLayout />
}
