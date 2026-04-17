import { createBrowserRouter, Navigate } from 'react-router-dom'
import App from '../App.jsx'
import { HomePage } from '../screens/home/HomePage.jsx'
import { RegisterPage } from '../screens/auth/RegisterPage.jsx'
import { LoginPage } from '../screens/auth/LoginPage.jsx'
import { DashboardPage } from '../screens/dashboard/DashboardPage.jsx'
import { DashboardLayout } from '../screens/dashboard/DashboardLayout.jsx'
import { DashboardPlaceholder } from '../screens/dashboard/DashboardPlaceholder.jsx'
import { DashboardPersonasByRol } from '../screens/dashboard/DashboardPersonasByRol.jsx'
import { RecoverPasswordPage } from '../screens/auth/RecoverPasswordPage.jsx'
import { ResetPasswordPage } from '../screens/auth/ResetPasswordPage.jsx'
import { RoleManagementPage } from '../screens/admin/RoleManagementPage.jsx'
import { ForbiddenPage } from '../screens/errors/ForbiddenPage.jsx'
import { ProfilePage } from '../screens/profile/ProfilePage.jsx'
import { RequireAuth } from './RequireAuth.jsx'
import { RequireRole } from './RequireRole.jsx'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'registro',
        element: <RegisterPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'perfil',
        element: (
          <RequireAuth>
            <ProfilePage />
          </RequireAuth>
        ),
      },
      {
        path: 'recuperar-contrasena',
        element: <RecoverPasswordPage />,
      },
      {
        path: 'restablecer-contrasena',
        element: <ResetPasswordPage />,
      },
      {
        path: 'admin/roles',
        element: (
          <RequireRole role="super_admin">
            <Navigate to="/dashboard/roles" replace />
          </RequireRole>
        ),
      },
      {
        path: '403',
        element: <ForbiddenPage />,
      },
      {
        path: 'dashboard',
        element: (
          <RequireRole role="super_admin">
            <DashboardLayout />
          </RequireRole>
        ),
        children: [
          {
            index: true,
            element: <DashboardPage title="Inicio" />,
          },
          {
            path: 'roles',
            element: <RoleManagementPage embedded />,
          },
          {
            path: 'alumnos',
            element: <DashboardPersonasByRol title="Alumnos" rolNombre="alumno" />,
          },
          {
            path: 'profesores',
            element: <DashboardPersonasByRol title="Profesores" rolNombre="profesor" />,
          },
          {
            path: 'secretaria',
            element: <DashboardPersonasByRol title="Secretaría" rolNombre="secretaria" />,
          },
          {
            path: 'materias',
            element: (
              <DashboardPlaceholder
                title="Materias"
                description="Próximamente: listado y gestión de materias (ABM / correlativas / asignaciones)."
              />
            ),
          },
          {
            path: '*',
            element: <Navigate to="/dashboard" replace />,
          },
        ],
      },
    ],
  },
])

