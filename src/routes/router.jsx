import { createBrowserRouter } from 'react-router-dom'
import App from '../App.jsx'
import { HomePage } from '../screens/home/HomePage.jsx'
import { RegisterPage } from '../screens/auth/RegisterPage.jsx'
import { LoginPage } from '../screens/auth/LoginPage.jsx'
import { DashboardPage } from '../screens/dashboard/DashboardPage.jsx'
import { RecoverPasswordPage } from '../screens/auth/RecoverPasswordPage.jsx'
import { ResetPasswordPage } from '../screens/auth/ResetPasswordPage.jsx'
import { RoleManagementPage } from '../screens/admin/RoleManagementPage.jsx'
import { ForbiddenPage } from '../screens/errors/ForbiddenPage.jsx'
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
            <RoleManagementPage />
          </RequireRole>
        ),
      },
      {
        path: '403',
        element: <ForbiddenPage />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage title="Dashboard" />,
      },
      {
        path: 'dashboard/alumno',
        element: <DashboardPage title="Dashboard Alumno" />,
      },
      {
        path: 'dashboard/profesor',
        element: <DashboardPage title="Dashboard Profesor" />,
      },
      {
        path: 'dashboard/secretaria',
        element: <DashboardPage title="Dashboard Secretaría" />,
      },
      {
        path: 'dashboard/admin',
        element: <DashboardPage title="Dashboard Admin" />,
      },
    ],
  },
])

