import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './authPages.css'
import { esCorreoValido } from '../../lib/authValidation'
import { requestPasswordRecovery } from '../../services/auth'

export function RecoverPasswordPage() {
  const navigate = useNavigate()
  const [correo, setCorreo] = useState('')
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [alert, setAlert] = useState(null)
  const [okData, setOkData] = useState(null)

  const error = useMemo(() => {
    if (!correo.trim()) return 'El correo electrónico es obligatorio.'
    if (!esCorreoValido(correo)) return 'El correo no tiene un formato válido. Use usuario@dominio.com.'
    return null
  }, [correo])

  const canSubmit = !error && !submitting

  async function onSubmit(e) {
    e.preventDefault()
    setTouched(true)
    setAlert(null)
    setOkData(null)
    if (error) return

    setSubmitting(true)
    const res = await requestPasswordRecovery({ correo })
    setSubmitting(false)

    if (!res.ok) {
      // CA01: si el correo no existe, el backend devuelve 404 con error en campo Correo.
      const msg =
        res.errores?.find((x) => String(x.campo ?? '').toLowerCase() === 'correo')?.mensaje ??
        res.message
      setAlert(msg || 'No hay ninguna cuenta registrada con este correo. Verificá la dirección o registrate.')
      return
    }

    const mensaje =
      res.data?.mensaje ??
      'Se generó el enlace de recuperación. Si está configurado el envío por correo, lo recibirás en tu bandeja.'
    setOkData({
      mensaje,
      expiraEnMinutos: res.data?.expiraEnMinutos ?? null,
    })

    // Si el backend devuelve el enlace (en dev), opcionalmente navegar directo:
    const enlace = res.data?.enlaceRecuperacion ?? null
    if (enlace && typeof enlace === 'string' && enlace.includes('token=')) {
      try {
        const url = new URL(enlace)
        if (url.pathname.includes('restablecer-contrasena')) {
          navigate(`${url.pathname}${url.search}`, { replace: true })
        }
      } catch {
        // noop
      }
    }
  }

  return (
    <div className="authWrap">
      <div className="authCard authCardCompact">
        <div className="pill pillPaso1">Paso 1</div>
        <div className="brand">
          <div className="dots" aria-hidden="true">
            <span style={{ background: '#D7263D' }} />
            <span style={{ background: '#F4A024' }} />
            <span style={{ background: '#1B9E77' }} />
            <span style={{ background: '#2B6CB0' }} />
          </div>
          <div className="brandName">EIMA</div>
        </div>

        <div className="cardTitle">¿Olvidaste tu contraseña?</div>
        <div className="cardSubtle">Ingresá tu correo y te enviamos un enlace.</div>

        {alert ? <div className="alert">{alert}</div> : null}
        {okData ? (
          <>
            <div className="pill pillPaso2">Paso 2</div>
            <div className="successBox">Enlace enviado a {correo.trim()}. Revisá tu bandeja.</div>
            <div className="note">
              El enlace expira en {okData.expiraEnMinutos ?? 30} minutos. Si no lo ves, revisá el spam.
            </div>
          </>
        ) : null}

        <form onSubmit={onSubmit} noValidate>
          <div className={touched && error ? 'field fieldErr' : 'field'}>
            <label htmlFor="correo">Correo electrónico</label>
            <input
              id="correo"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              onBlur={() => setTouched(true)}
              autoComplete="email"
              inputMode="email"
            />
            {touched && error ? <div className="emsg">{error}</div> : null}
          </div>

          <button className="btn" type="submit" disabled={!canSubmit}>
            {submitting ? 'Recuperando...' : 'Recuperar contraseña'}
          </button>

          <div className="foot">
            <Link to="/login">Volver a login</Link>
            <Link to="/registro">Registrarse</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

