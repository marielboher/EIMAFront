import { createBrowserRouter, Navigate } from 'react-router-dom'
import App from '../App.jsx'
import { HomePage } from '../screens/home/HomePage.jsx'
import { RegisterPage } from '../screens/auth/RegisterPage.jsx'
import { LoginPage } from '../screens/auth/LoginPage.jsx'
import { DashboardRoot } from '../screens/dashboard/DashboardRoot.jsx'
import { DashboardIndex, DashboardCatchAll } from '../screens/dashboard/DashboardIndex.jsx'
import { DashboardPlaceholder } from '../screens/dashboard/DashboardPlaceholder.jsx'
import { DashboardPersonasByRol } from '../screens/dashboard/DashboardPersonasByRol.jsx'
import { RecoverPasswordPage } from '../screens/auth/RecoverPasswordPage.jsx'
import { ResetPasswordPage } from '../screens/auth/ResetPasswordPage.jsx'
import { RoleManagementPage } from '../screens/admin/RoleManagementPage.jsx'
import { ForbiddenPage } from '../screens/errors/ForbiddenPage.jsx'
import { ProfilePage } from '../screens/profile/ProfilePage.jsx'
import { ContactoPage } from '../screens/contacto/ContactoPage.jsx'
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
        path: 'contacto',
        element: <ContactoPage />,
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
          <RequireAuth>
            <DashboardRoot />
          </RequireAuth>
        ),
        children: [
          {
            index: true,
            element: <DashboardIndex />,
          },
          {
            path: 'roles',
            element: (
              <RequireRole role="super_admin" redirectTo="/dashboard">
                <RoleManagementPage embedded />
              </RequireRole>
            ),
          },
          {
            path: 'alumnos',
            element: (
              <RequireRole role="super_admin" redirectTo="/dashboard">
                <DashboardPersonasByRol title="Alumnos" rolNombre="alumno" />
              </RequireRole>
            ),
          },
          {
            path: 'profesores',
            element: (
              <RequireRole role="super_admin" redirectTo="/dashboard">
                <DashboardPersonasByRol title="Profesores" rolNombre="profesor" />
              </RequireRole>
            ),
          },
          {
            path: 'secretaria',
            element: (
              <RequireRole role="super_admin" redirectTo="/dashboard">
                <DashboardPersonasByRol title="Secretaría" rolNombre="secretaria" />
              </RequireRole>
            ),
          },
          {
            path: 'materias',
            element: (
              <RequireRole role="super_admin" redirectTo="/dashboard">
                <DashboardPlaceholder
                  title="Materias"
                  description="Próximamente: listado y gestión de materias (ABM / correlativas / asignaciones)."
                />
              </RequireRole>
            ),
          },
          {
            path: '*',
            element: <DashboardCatchAll />,
          },
        ],
      },
    ],
  },
])
