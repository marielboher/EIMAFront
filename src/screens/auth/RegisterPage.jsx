import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './authPages.css'
import { registerUser } from '../../services/auth'
import {
  calcularFortalezaLocal,
  esCorreoValido,
  requisitosContrasenaIncumplidos,
} from '../../lib/authValidation'

function onlyDigitsOrSeparators(value) {
  return value.replace(/[^\d.\- ]/g, '')
}

function mergeMessages(a, b) {
  const toArr = (x) => {
    if (x == null || x === '') return []
    return Array.isArray(x) ? [...x] : [x]
  }
  const seen = new Set()
  const out = []
  for (const m of [...toArr(a), ...toArr(b)]) {
    if (!m || seen.has(m)) continue
    seen.add(m)
    out.push(m)
  }
  if (out.length === 0) return undefined
  if (out.length === 1) return out[0]
  return out
}

function mergeFieldErrors(local, api) {
  const out = { ...local }
  for (const [k, v] of Object.entries(api)) {
    if (out[k] === undefined) out[k] = v
    else out[k] = mergeMessages(out[k], v)
  }
  return out
}

function hasValidationErrors(err) {
  if (!err || typeof err !== 'object') return false
  for (const v of Object.values(err)) {
    if (v == null) continue
    if (Array.isArray(v)) {
      if (v.length) return true
    } else if (typeof v === 'string' && v.length) return true
  }
  return false
}

function fieldHasError(errors, name) {
  const v = errors[name]
  if (v == null) return false
  if (Array.isArray(v)) return v.length > 0
  return String(v).length > 0
}

function validate(values) {
  const errors = {}

  if (!values.nombre.trim()) errors.nombre = 'El nombre es obligatorio. Ingrese su nombre.'
  if (!values.apellido.trim()) errors.apellido = 'El apellido es obligatorio. Ingrese su apellido.'

  if (!values.correo.trim()) {
    errors.correo = 'El correo electrónico es obligatorio. Ingrese un correo válido (usuario@dominio.com).'
  } else if (!esCorreoValido(values.correo)) {
    errors.correo =
      'El correo no tiene un formato válido. Use el formato usuario@dominio.com (sin espacios).'
  }

  if (!values.dni.trim()) errors.dni = 'El DNI o documento es obligatorio. Ingrese su número de documento.'
  if (!values.telefono.trim()) errors.telefono = 'El teléfono es obligatorio. Ingrese un número de contacto.'
  if (!values.direccion.trim()) errors.direccion = 'La dirección es obligatoria. Ingrese su domicilio.'

  if (!values.contrasena) {
    errors.contrasena = 'La contraseña es obligatoria.'
  } else {
    const incumplidos = requisitosContrasenaIncumplidos(values.contrasena)
    if (incumplidos.length) errors.contrasena = incumplidos
  }

  if (!values.confirmarContrasena) {
    errors.confirmarContrasena = 'Debe confirmar la contraseña. Complete el campo de confirmación.'
  } else if (
    values.contrasena &&
    values.confirmarContrasena !== values.contrasena
  ) {
    errors.confirmarContrasena =
      'Las contraseñas no coinciden. Asegúrese de escribir la misma contraseña en ambos campos.'
  }

  return errors
}

function renderFieldMessages(msg) {
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

function strengthClassFromNivel(nivel) {
  const n = String(nivel ?? '')
    .replace(/[^a-z]/gi, '')
    .toLowerCase()
  if (n === 'muydebil') return 'strengthMuyDebil'
  if (n === 'debil') return 'strengthDebil'
  if (n === 'media') return 'strengthMedia'
  if (n === 'fuerte') return 'strengthFuerte'
  return ''
}

export function RegisterPage() {
  const navigate = useNavigate()

  const [values, setValues] = useState({
    dni: '',
    nombre: '',
    apellido: '',
    correo: '',
    telefono: '',
    direccion: '',
    contrasena: '',
    confirmarContrasena: '',
  })
  const [touched, setTouched] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)
  const [apiFieldErrors, setApiFieldErrors] = useState({})

  const localErrors = useMemo(() => validate(values), [values])
  const errors = useMemo(
    () => mergeFieldErrors(localErrors, apiFieldErrors),
    [localErrors, apiFieldErrors],
  )

  const canSubmit = !hasValidationErrors(errors) && !submitting
  // Fortaleza: cálculo 100% local (sin dependencia de red)
  const strength = useMemo(
    () => (values.contrasena ? calcularFortalezaLocal(values.contrasena) : null),
    [values.contrasena],
  )

  function setField(name, value) {
    setApiFieldErrors((prev) => {
      if (!prev[name]) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })
    setValues((v) => ({ ...v, [name]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setFormError(null)
    setApiFieldErrors({})
    setTouched({
      dni: true,
      nombre: true,
      apellido: true,
      correo: true,
      telefono: true,
      direccion: true,
      contrasena: true,
      confirmarContrasena: true,
    })

    const currentErrors = validate(values)
    if (hasValidationErrors(currentErrors)) return

    setSubmitting(true)
    const payload = {
      dni: values.dni,
      nombre: values.nombre,
      apellido: values.apellido,
      correo: values.correo,
      telefono: values.telefono,
      direccion: values.direccion,
      contrasena: values.contrasena,
      confirmarContrasena: values.confirmarContrasena,
    }

    const res = await registerUser(payload)
    setSubmitting(false)

    if (!res.ok) {
      if (Array.isArray(res.errores) && res.errores.length) {
        const nextTouched = {}
        const nextApiErrors = {}
        for (const er of res.errores) {
          const field = (er.campo ?? er.Campo ?? '').toString()
          const key = field ? field.charAt(0).toLowerCase() + field.slice(1) : ''
          const msg = er.mensaje ?? er.Mensaje ?? ''
          if (!key || !msg) continue
          nextTouched[key] = true
          if (nextApiErrors[key]) nextApiErrors[key] = mergeMessages(nextApiErrors[key], msg)
          else nextApiErrors[key] = msg
        }
        setTouched((t) => ({ ...t, ...nextTouched }))
        setApiFieldErrors(nextApiErrors)

        const hasAnyMapped = Object.keys(nextApiErrors).some((k) => k in values)
        setFormError(hasAnyMapped ? null : res.message)
      } else {
        setFormError(res.message)
      }
      return
    }

    const mensaje =
      res.data?.mensaje ??
      'Registro completado correctamente. Podés iniciar sesión con tu correo y contraseña.'

    navigate('/login', { replace: true, state: { flashOk: mensaje } })
  }

  function fieldClass(name) {
    if (!touched[name]) return 'field'
    if (fieldHasError(errors, name)) return 'field fieldErr'
    return 'field fieldOk'
  }

  const nivel = strength?.nivel ?? strength?.Nivel
  const descFortaleza = strength?.descripcion ?? strength?.Descripcion

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

        <div className="cardSub">Crear cuenta nueva</div>

        {formError ? <div className="flashErr">{formError}</div> : null}

        <form onSubmit={onSubmit} noValidate>
          <div className="grid2">
            <div className={fieldClass('nombre')}>
              <label htmlFor="nombre">Nombre</label>
              <input
                id="nombre"
                value={values.nombre}
                onChange={(e) => setField('nombre', e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, nombre: true }))}
                autoComplete="given-name"
                aria-invalid={touched.nombre && fieldHasError(errors, 'nombre')}
              />
              {touched.nombre && fieldHasError(errors, 'nombre')
                ? renderFieldMessages(errors.nombre)
                : null}
            </div>

            <div className={fieldClass('apellido')}>
              <label htmlFor="apellido">Apellido</label>
              <input
                id="apellido"
                value={values.apellido}
                onChange={(e) => setField('apellido', e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, apellido: true }))}
                autoComplete="family-name"
                aria-invalid={touched.apellido && fieldHasError(errors, 'apellido')}
              />
              {touched.apellido && errors.apellido ? (
                renderFieldMessages(errors.apellido)
              ) : null}
            </div>
          </div>

          <div className={fieldClass('correo')}>
            <label htmlFor="correo">Correo electrónico</label>
            <input
              id="correo"
              type="email"
              value={values.correo}
              onChange={(e) => setField('correo', e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, correo: true }))}
              autoComplete="email"
              inputMode="email"
              aria-invalid={touched.correo && fieldHasError(errors, 'correo')}
            />
            {touched.correo && errors.correo ? renderFieldMessages(errors.correo) : null}
          </div>

          <div className="grid2">
            <div className={fieldClass('dni')}>
              <label htmlFor="dni">DNI / Documento</label>
              <input
                id="dni"
                value={values.dni}
                onChange={(e) => setField('dni', onlyDigitsOrSeparators(e.target.value))}
                onBlur={() => setTouched((t) => ({ ...t, dni: true }))}
                autoComplete="off"
                inputMode="numeric"
                aria-invalid={touched.dni && fieldHasError(errors, 'dni')}
              />
              {touched.dni && errors.dni ? renderFieldMessages(errors.dni) : null}
            </div>

            <div className={fieldClass('telefono')}>
              <label htmlFor="telefono">Teléfono</label>
              <input
                id="telefono"
                value={values.telefono}
                onChange={(e) => setField('telefono', e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, telefono: true }))}
                autoComplete="tel"
                inputMode="tel"
                aria-invalid={touched.telefono && fieldHasError(errors, 'telefono')}
              />
              {touched.telefono && errors.telefono ? (
                renderFieldMessages(errors.telefono)
              ) : null}
            </div>
          </div>

          <div className={fieldClass('direccion')}>
            <label htmlFor="direccion">Dirección</label>
            <input
              id="direccion"
              value={values.direccion}
              onChange={(e) => setField('direccion', e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, direccion: true }))}
              autoComplete="street-address"
              aria-invalid={touched.direccion && fieldHasError(errors, 'direccion')}
            />
            {touched.direccion && errors.direccion ? (
              renderFieldMessages(errors.direccion)
            ) : null}
          </div>

          <div className={fieldClass('contrasena')}>
            <label htmlFor="contrasena">Contraseña</label>
            <input
              id="contrasena"
              type="password"
              value={values.contrasena}
              onChange={(e) => setField('contrasena', e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, contrasena: true }))}
              autoComplete="new-password"
              aria-invalid={touched.contrasena && fieldHasError(errors, 'contrasena')}
              aria-describedby={values.contrasena ? 'pw-strength' : undefined}
            />
            {values.contrasena ? (
              <div
                id="pw-strength"
                className={`strengthRow ${strengthClassFromNivel(nivel)}`}
                aria-live="polite"
              >
                Fortaleza: {descFortaleza ?? 'Muy débil'}
              </div>
            ) : null}
            {touched.contrasena && errors.contrasena ? (
              renderFieldMessages(errors.contrasena)
            ) : null}
          </div>

          <div className={fieldClass('confirmarContrasena')}>
            <label htmlFor="confirmarContrasena">Confirmar contraseña</label>
            <input
              id="confirmarContrasena"
              type="password"
              value={values.confirmarContrasena}
              onChange={(e) => setField('confirmarContrasena', e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, confirmarContrasena: true }))}
              autoComplete="new-password"
              placeholder="Repetí la contraseña"
              aria-invalid={touched.confirmarContrasena && fieldHasError(errors, 'confirmarContrasena')}
            />
            {touched.confirmarContrasena && errors.confirmarContrasena ? (
              renderFieldMessages(errors.confirmarContrasena)
            ) : null}
          </div>

          <button className="btn" type="submit" disabled={!canSubmit}>
            {submitting ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>

          <div className="link">
            ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
