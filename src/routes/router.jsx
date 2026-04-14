import { createBrowserRouter } from 'react-router-dom'
import App from '../App.jsx'
import { HomePage } from '../screens/home/HomePage.jsx'
import { RegisterPage } from '../screens/auth/RegisterPage.jsx'
import { LoginPage } from '../screens/auth/LoginPage.jsx'

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
    ],
  },
])

