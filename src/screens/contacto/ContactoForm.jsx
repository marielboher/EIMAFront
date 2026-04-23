import { useEffect, useMemo, useState } from 'react'
import '../auth/authPages.css'
import './contactoPage.css'
import { esCorreoValido } from '../../lib/authValidation'
import { toastError, toastSuccess } from '../../lib/alerts'
import { enviarConsultaPublica } from '../../services/consultas'
import { fetchMateriasCatalogoPorArea } from '../../services/materias'

const opcionesAsunto = [
  { value: '', label: 'Elegí un asunto…' },
  { value: 'Inscripciones y aranceles', label: 'Inscripciones y aranceles' },
  { value: 'Cursos y talleres', label: 'Cursos y talleres' },
  { value: 'Clases particulares', label: 'Clases particulares' },
  { value: 'Soporte técnico / plataforma', label: 'Soporte técnico / plataforma' },
  { value: 'Otro', label: 'Otro' },
]

function validate(values) {
  const errors = {}
  if (!values.nombre.trim()) errors.nombre = 'El nombre es obligatorio.'
  if (!values.apellido.trim()) errors.apellido = 'El apellido es obligatorio.'
  if (!values.email.trim()) {
    errors.email = 'El correo electrónico es obligatorio.'
  } else if (!esCorreoValido(values.email)) {
    errors.email = 'Ingresá un correo válido (usuario@dominio.com).'
  }
  if (!values.telefono.trim()) errors.telefono = 'El teléfono es obligatorio.'
  if (!values.area.trim()) errors.area = 'Elegí un área.'
  const mid = Number.parseInt(String(values.materiaId), 10)
  if (!Number.isFinite(mid) || mid < 1) errors.materiaId = 'Elegí una materia del listado.'
  if (!values.asunto.trim()) errors.asunto = 'Elegí un asunto de la lista.'
  if (!values.mensaje.trim()) errors.mensaje = 'Escribí tu mensaje.'
  else if (values.mensaje.length > 4000) errors.mensaje = 'El mensaje no puede superar los 4000 caracteres.'
  return errors
}

function fieldClass(touched, err) {
  if (!touched) return 'field'
  return err ? 'field fieldErr' : 'field fieldOk'
}

export function ContactoForm({ embedded = false }) {
  const [catalogo, setCatalogo] = useState([])
  const [catalogoCargando, setCatalogoCargando] = useState(true)
  const [catalogoError, setCatalogoError] = useState(null)

  const [values, setValues] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    area: '',
    materiaId: '',
    asunto: '',
    mensaje: '',
  })
  const [touched, setTouched] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const errors = useMemo(() => validate(values), [values])

  const materiasEnArea = useMemo(() => {
    if (!values.area) return []
    const grupo = catalogo.find((g) => g.area === values.area)
    return grupo?.materias ?? []
  }, [catalogo, values.area])

  useEffect(() => {
    const ac = new AbortController()
    let cancelado = false
    setCatalogoCargando(true)
    setCatalogoError(null)
    ;(async () => {
      try {
        const data = await fetchMateriasCatalogoPorArea({ signal: ac.signal })
        if (!cancelado) setCatalogo(data)
      } catch {
        if (ac.signal.aborted || cancelado) return
        setCatalogoError('No se pudo cargar el listado de materias. Recargá la página o probá más tarde.')
      } finally {
        if (!cancelado) setCatalogoCargando(false)
      }
    })()
    return () => {
      cancelado = true
      ac.abort()
    }
  }, [])

  function setField(name, v) {
    setValues((prev) => ({ ...prev, [name]: v }))
  }

  function onAreaChange(area) {
    setValues((prev) => ({ ...prev, area, materiaId: '' }))
  }

  function touchAll() {
    setTouched({
      nombre: true,
      apellido: true,
      email: true,
      telefono: true,
      area: true,
      materiaId: true,
      asunto: true,
      mensaje: true,
    })
  }

  async function onSubmit(e) {
    e.preventDefault()
    touchAll()
    if (Object.keys(validate(values)).length) return

    setSubmitting(true)
    const res = await enviarConsultaPublica({
      nombre: values.nombre.trim(),
      apellido: values.apellido.trim(),
      email: values.email.trim(),
      telefono: values.telefono.trim(),
      materiaId: Number.parseInt(String(values.materiaId), 10),
      asunto: values.asunto.trim(),
      mensaje: values.mensaje.trim(),
    })
    setSubmitting(false)

    if (!res.ok) {
      toastError({ title: res.message || 'No se pudo enviar la consulta.' })
      return
    }

    toastSuccess({ title: 'Consulta enviada. Te vamos a contactar a la brevedad.' })
    setValues({
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      area: '',
      materiaId: '',
      asunto: '',
      mensaje: '',
    })
    setTouched({})
  }

  const formBloqueado = catalogoCargando || Boolean(catalogoError) || catalogo.length === 0

  return (
    <div className={embedded ? 'contactoEmbed' : ''}>
      <div className={embedded ? 'contactoEmbedCard' : 'authCard contactoCard'}>
        {!embedded ? (
          <div className="brand">
            <div className="dots" aria-hidden="true">
              <span style={{ background: '#D7263D' }} />
              <span style={{ background: '#F4A024' }} />
              <span style={{ background: '#1B9E77' }} />
              <span style={{ background: '#2B6CB0' }} />
            </div>
            <div className="brandName">EIMA</div>
          </div>
        ) : null}

        <div className="cardTitle">Contacto</div>
        <div className="cardSubtle">
          Escribinos y te respondemos a la brevedad. Los datos se registran como una consulta en nuestro sistema.
        </div>

        {catalogoCargando ? <div className="cardSubtle">Cargando materias…</div> : null}
        {catalogoError ? <div className="alert">{catalogoError}</div> : null}
        {!catalogoCargando && !catalogoError && catalogo.length === 0 ? (
          <div className="alert">No hay materias disponibles en este momento.</div>
        ) : null}

        <form onSubmit={onSubmit} noValidate>
          <div className="grid2">
            <div className={fieldClass(touched.nombre, errors.nombre)}>
              <label htmlFor="contacto-nombre">Nombre</label>
              <input
                id="contacto-nombre"
                name="nombre"
                autoComplete="given-name"
                value={values.nombre}
                onChange={(e) => setField('nombre', e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, nombre: true }))}
                disabled={formBloqueado}
              />
              {touched.nombre && errors.nombre ? <div className="emsg">{errors.nombre}</div> : null}
            </div>
            <div className={fieldClass(touched.apellido, errors.apellido)}>
              <label htmlFor="contacto-apellido">Apellido</label>
              <input
                id="contacto-apellido"
                name="apellido"
                autoComplete="family-name"
                value={values.apellido}
                onChange={(e) => setField('apellido', e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, apellido: true }))}
                disabled={formBloqueado}
              />
              {touched.apellido && errors.apellido ? <div className="emsg">{errors.apellido}</div> : null}
            </div>
          </div>

          <div className="grid2">
            <div className={fieldClass(touched.email, errors.email)}>
              <label htmlFor="contacto-email">Correo electrónico</label>
              <input
                id="contacto-email"
                name="email"
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={(e) => setField('email', e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                disabled={formBloqueado}
              />
              {touched.email && errors.email ? <div className="emsg">{errors.email}</div> : null}
            </div>
            <div className={fieldClass(touched.telefono, errors.telefono)}>
              <label htmlFor="contacto-telefono">Teléfono</label>
              <input
                id="contacto-telefono"
                name="telefono"
                type="tel"
                autoComplete="tel"
                value={values.telefono}
                onChange={(e) => setField('telefono', e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, telefono: true }))}
                disabled={formBloqueado}
              />
              {touched.telefono && errors.telefono ? <div className="emsg">{errors.telefono}</div> : null}
            </div>
          </div>

          <div className={fieldClass(touched.area, errors.area)}>
            <label htmlFor="contacto-area">Área</label>
            <select
              id="contacto-area"
              name="area"
              className="contactoSelect"
              value={values.area}
              onChange={(e) => onAreaChange(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, area: true }))}
              disabled={formBloqueado}
            >
              <option value="">Elegí un área…</option>
              {catalogo.map((g) => (
                <option key={g.area} value={g.area}>
                  {g.area}
                </option>
              ))}
            </select>
            {touched.area && errors.area ? <div className="emsg">{errors.area}</div> : null}
          </div>

          <div className={fieldClass(touched.materiaId, errors.materiaId)}>
            <label htmlFor="contacto-materia-id">Materia</label>
            <select
              id="contacto-materia-id"
              name="materiaId"
              className="contactoSelect"
              value={values.materiaId}
              onChange={(e) => setField('materiaId', e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, materiaId: true }))}
              disabled={formBloqueado || !values.area}
            >
              <option value="">{values.area ? 'Elegí una materia…' : 'Primero elegí un área'}</option>
              {materiasEnArea.map((m) => (
                <option key={m.id} value={String(m.id)}>
                  {m.nombre}
                </option>
              ))}
            </select>
            {touched.materiaId && errors.materiaId ? <div className="emsg">{errors.materiaId}</div> : null}
          </div>

          <div className={fieldClass(touched.asunto, errors.asunto)}>
            <label htmlFor="contacto-asunto">Asunto</label>
            <select
              id="contacto-asunto"
              name="asunto"
              className="contactoSelect"
              value={values.asunto}
              onChange={(e) => setField('asunto', e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, asunto: true }))}
              disabled={formBloqueado}
            >
              {opcionesAsunto.map((o) => (
                <option key={o.value || 'empty'} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            {touched.asunto && errors.asunto ? <div className="emsg">{errors.asunto}</div> : null}
          </div>

          <div className={fieldClass(touched.mensaje, errors.mensaje)}>
            <label htmlFor="contacto-mensaje">Mensaje</label>
            <textarea
              id="contacto-mensaje"
              name="mensaje"
              className="contactoTextarea"
              rows={6}
              value={values.mensaje}
              onChange={(e) => setField('mensaje', e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, mensaje: true }))}
              disabled={formBloqueado}
            />
            <div className="contactoMeta">
              {values.mensaje.length} / 4000
              {touched.mensaje && errors.mensaje ? <span className="emsgInline">{errors.mensaje}</span> : null}
            </div>
          </div>

          <button type="submit" className="btn" disabled={submitting || formBloqueado}>
            {submitting ? 'Enviando…' : 'Enviar consulta'}
          </button>
        </form>
      </div>
    </div>
  )
}

