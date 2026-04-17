import { Outlet } from 'react-router-dom'
import { AppNav } from './components/AppNav.jsx'

function App() {
  return (
    <>
      <AppNav />
      <Outlet />
    </>
  )
}

export default App
