import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import './authPages.css'
import { requisitosContrasenaIncumplidos } from '../../lib/authValidation'
import { resetPassword } from '../../services/auth'

function useQuery() {
  const { search } = useLocation()
  return useMemo(() => new URLSearchParams(search), [search])
}

function fieldHasError(v) {
  if (v == null) return false
  if (Array.isArray(v)) return v.length > 0
  return String(v).length > 0
}

function renderMessages(msg) {
  if (msg == null || msg === '') return null
  if (Array.isArray(msg)) {
    return (
      <ul className="emsgList" role="list">
        {msg.map((m, i) => (
          <li key={i}>{m}</li>
        ))}
      </ul>
    )
  }
  return <div className="emsg">{msg}</div>
}

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const q = useQuery()
  const token = q.get('token') ?? ''

  const [values, setValues] = useState({ nueva: '', confirmar: '' })
  const [touched, setTouched] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [alert, setAlert] = useState(null)

  const errors = useMemo(() => {
    const e = {}
    if (!token) e.token = 'El enlace de recuperación no es válido. Solicitá uno nuevo.'

    if (!values.nueva) e.nueva = 'La contraseña es obligatoria.'
    else {
      const inc = requisitosContrasenaIncumplidos(values.nueva)
      if (inc.length) e.nueva = inc
    }

    if (!values.confirmar) e.confirmar = 'Debe confirmar la contraseña.'
    else if (values.nueva && values.confirmar !== values.nueva)
      e.confirmar = 'Las contraseñas no coinciden.'

    return e
  }, [token, values])

  const canSubmit = !Object.values(errors).some(fieldHasError) && !submitting

  async function onSubmit(e) {
    e.preventDefault()
    setAlert(null)
    setTouched({ nueva: true, confirmar: true, token: true })

    if (Object.values(errors).some(fieldHasError)) return

    setSubmitting(true)
    const res = await resetPassword({
      token,
      nuevaContrasena: values.nueva,
      confirmarContrasena: values.confirmar,
    })
    setSubmitting(false)

    if (!res.ok) {
      // CA04: token inválido/expirado/usado => error en Token (400)
      const msg =
        res.errores?.find((x) => String(x.campo ?? '').toLowerCase() === 'token')?.mensaje ??
        res.message
      setAlert(msg || 'El enlace de recuperación no es válido, expiró o ya fue utilizado.')
      return
    }

    const mensaje = res.data?.mensaje ?? 'Su contraseña se actualizó correctamente. Ya puede iniciar sesión.'
    navigate('/login', { replace: true, state: { flashOk: mensaje } })
  }

  return (
    <div className="authWrap">
      <div className="authCard authCardCompact">
        <div className="brand">
          <div className="dots" aria-hidden="true">
            <span style={{ background: '#D7263D' }} />
            <span style={{ background: '#F4A024' }} />
            <span style={{ background: '#1B9E77' }} />
            <span style={{ background: '#2B6CB0' }} />
          </div>
          <div className="brandName">EIMA</div>
        </div>

        <div className="cardTitle">Restablecer contraseña</div>
        <div className="cardSubtle">Ingresá tu nueva contraseña.</div>

        {alert ? <div className="alert">{alert}</div> : null}
        {touched.token && errors.token ? <div className="alert">{errors.token}</div> : null}

        <form onSubmit={onSubmit} noValidate>
          <div className={!touched.nueva ? 'field' : errors.nueva ? 'field fieldErr' : 'field fieldOk'}>
            <label htmlFor="nueva">Nueva contraseña</label>
            <input
              id="nueva"
              type="password"
              value={values.nueva}
              onChange={(e) => setValues((v) => ({ ...v, nueva: e.target.value }))}
              onBlur={() => setTouched((t) => ({ ...t, nueva: true }))}
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
            />
            {touched.nueva && errors.nueva ? renderMessages(errors.nueva) : null}
          </div>

          <div
            className={!touched.confirmar ? 'field' : errors.confirmar ? 'field fieldErr' : 'field fieldOk'}
          >
            <label htmlFor="confirmar">Confirmar contraseña</label>
            <input
              id="confirmar"
              type="password"
              value={values.confirmar}
              onChange={(e) => setValues((v) => ({ ...v, confirmar: e.target.value }))}
              onBlur={() => setTouched((t) => ({ ...t, confirmar: true }))}
              autoComplete="new-password"
              placeholder="Repetí la contraseña"
            />
            {touched.confirmar && errors.confirmar ? renderMessages(errors.confirmar) : null}
          </div>

          <button className="btn" type="submit" disabled={!canSubmit}>
            {submitting ? 'Guardando...' : 'Guardar nueva contraseña'}
          </button>

          <div className="foot">
            <Link to="/login">Volver a iniciar sesión</Link>
            <Link to="/recuperar-contrasena">Solicitar nuevo enlace</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

