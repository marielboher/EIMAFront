import { Outlet, useLocation } from 'react-router-dom'
import { AppNav } from './components/AppNav.jsx'
import { useEffect } from 'react'

function App() {
  const location = useLocation()

  useEffect(() => {
    if (!location.hash) return
    const id = location.hash.replace('#', '').trim()
    if (!id) return
    const el = document.getElementById(id)
    if (!el) return
    // Deja que el layout pinte antes de scrollear (y evita que el sticky nav lo tape).
    setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
  }, [location.pathname, location.hash])

  return (
    <>
      <AppNav />
      <Outlet />
    </>
  )
}

export default App
