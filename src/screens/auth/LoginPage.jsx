import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import './authPages.css'
import { esCorreoValido } from '../../lib/authValidation'
import { loginUser } from '../../services/auth'
import { clearSession, setAccessToken, setSessionInfo } from '../../lib/authStorage'
import { toastError, toastInfo } from '../../lib/alerts'
import { fetchMiPerfil } from '../../services/personas'

const DASHBOARD_SUPER_ADMIN_PATHS = new Set([
  '/dashboard',
  '/dashboard/roles',
  '/dashboard/alumnos',
  '/dashboard/profesores',
  '/dashboard/secretaria',
  '/dashboard/materias',
])

/** Rutas que el backend pudo sugerir antes de unificar el SPA en <c>/dashboard</c>. */
const DASHBOARD_LEGACY_PATHS = new Set([
  '/dashboard/admin',
  '/dashboard/alumno',
  '/dashboard/profesor',
])

function postLoginPath(rolBackend, redireccionSugerida) {
  const rol = String(rolBackend ?? '').toLowerCase()
  let sugerida = String(redireccionSugerida ?? '').trim()

  if (DASHBOARD_LEGACY_PATHS.has(sugerida)) sugerida = '/dashboard'

  if (rol === 'super_admin') {
    if (sugerida === '/dashboard' || sugerida === '') return '/dashboard'
    if (DASHBOARD_SUPER_ADMIN_PATHS.has(sugerida)) return sugerida
    if (sugerida.startsWith('/dashboard/')) return sugerida
    return '/dashboard'
  }

  if (sugerida.startsWith('/dashboard')) return '/dashboard'
  if (sugerida) return sugerida
  return '/dashboard'
}

export function LoginPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const flashOk = location.state?.flashOk ?? null
  const [values, setValues] = useState({ correo: '', contrasena: '' })
  const [touched, setTouched] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [alert, setAlert] = useState(null)

  const errors = useMemo(() => {
    const e = {}
    if (!values.correo.trim()) e.correo = 'El correo electrónico es obligatorio.'
    else if (!esCorreoValido(values.correo))
      e.correo = 'El correo no tiene un formato válido. Use usuario@dominio.com.'
    if (!values.contrasena) e.contrasena = 'La contraseña es obligatoria.'
    return e
  }, [values])

  const canSubmit = Object.keys(errors).length === 0 && !submitting

  function fieldClass(name) {
    if (!touched[name]) return 'field'
    if (errors[name]) return 'field fieldErr'
    return 'field fieldOk'
  }

  async function onSubmit(e) {
    e.preventDefault()
    setAlert(null)
    setTouched({ correo: true, contrasena: true })
    clearSession()

    if (Object.keys(errors).length) return

    setSubmitting(true)
    const res = await loginUser({
      correo: values.correo,
      contrasena: values.contrasena,
    })
    setSubmitting(false)

    if (!res.ok) {
      // CA02: mensaje genérico (sin indicar cuál campo falló)
      toastError({ title: 'Credenciales incorrectas. Verificá tu correo y contraseña.' })
      return
    }

    const rolBackend = String(res.data?.rol ?? res.data?.Rol ?? '').toLowerCase()

    const accessToken = res.data?.accessToken ?? res.data?.AccessToken ?? null
    const almacenamiento = res.data?.almacenamientoToken ?? res.data?.AlmacenamientoToken ?? null
    const personaId = res.data?.personaId ?? res.data?.PersonaId ?? null
    const redirect = postLoginPath(
      rolBackend,
      res.data?.redireccionSugerida ?? res.data?.RedireccionSugerida ?? '',
    )

    const expiraEnUtc = res.data?.expiraEnUtc ?? res.data?.ExpiraEnUtc ?? null

    // CA04: persistencia del token (Bearer) alineada a la expiración del backend (24h por defecto).
    // Si el backend usa cookie HttpOnly, el token puede venir null y el navegador maneja la cookie.
    if (accessToken && (almacenamiento === 'bearer' || !almacenamiento)) {
      setAccessToken(accessToken, { expiraEnUtc })
    }
    let perfilNombre = ''
    let perfilApellido = ''

    // Bienvenida (best-effort): si tenemos token y endpoint disponible, traemos el nombre.
    try {
      const perfil = await fetchMiPerfil()
      perfilNombre = String(perfil?.nombre ?? perfil?.Nombre ?? '').trim()
      perfilApellido = String(perfil?.apellido ?? perfil?.Apellido ?? '').trim()
      const full = [perfilNombre, perfilApellido].filter(Boolean).join(' ')
      if (full) {
        toastInfo({ title: `¡Bienvenido/a, ${full}!` })
      }
    } catch {
      // ignore
    }

    setSessionInfo({
      rol: rolBackend,
      personaId,
      almacenamientoToken: almacenamiento,
      expiraEnUtc,
      nombre: perfilNombre || undefined,
      apellido: perfilApellido || undefined,
    })

    navigate(redirect, { replace: true })
  }

  return (
    <div className="authWrap">
      <div className="authCard">
        <div className="brand">
          <div className="dots" aria-hidden="true">
            <span style={{ background: '#D7263D' }} />
            <span style={{ background: '#F4A024' }} />
            <span style={{ background: '#1B9E77' }} />
            <span style={{ background: '#2B6CB0' }} />
          </div>
          <div className="brandName">EIMA</div>
        </div>

        <div className="cardSub">Iniciar sesión</div>
        <div className="tagline">educar · inspirar · motivar · acompañar</div>

        {flashOk ? <div className="flashOk">{flashOk}</div> : null}
        {alert ? <div className="alert">{alert}</div> : null}

        <form onSubmit={onSubmit} noValidate>
          <div className={fieldClass('correo')}>
            <label htmlFor="correo">Correo electrónico</label>
            <input
              id="correo"
              type="email"
              value={values.correo}
              onChange={(e) => setValues((v) => ({ ...v, correo: e.target.value }))}
              onBlur={() => setTouched((t) => ({ ...t, correo: true }))}
              autoComplete="email"
              inputMode="email"
            />
            {touched.correo && errors.correo ? <div className="emsg">{errors.correo}</div> : null}
          </div>

          <div className={fieldClass('contrasena')}>
            <label htmlFor="contrasena">Contraseña</label>
            <input
              id="contrasena"
              type="password"
              value={values.contrasena}
              onChange={(e) => setValues((v) => ({ ...v, contrasena: e.target.value }))}
              onBlur={() => setTouched((t) => ({ ...t, contrasena: true }))}
              autoComplete="current-password"
            />
            {touched.contrasena && errors.contrasena ? (
              <div className="emsg">{errors.contrasena}</div>
            ) : null}
          </div>

          <button className="btn" type="submit" disabled={!canSubmit}>
            {submitting ? 'Ingresando...' : 'Iniciar sesión'}
          </button>

          <div className="foot">
            <Link to="/recuperar-contrasena">¿Olvidaste tu contraseña?</Link>
            <Link to="/registro">Registrarse</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

