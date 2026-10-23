import { useEffect, useState } from 'react'
import {
  createAsignacionAula,
  getOpcionesAsignacionAula,
  mensajeErrorAsignacion,
} from '../../../services/asignacionesAula'
import { toastError, toastSuccess } from '../../../lib/alerts'
import { minFechaHoraLocal } from './asignacionHelpers'
import '../personas/personas.css'
import './asignacionesAula.css'

const FORM_VACIO = {
  aulaId: '',
  materiaId: '',
  docenteId: '',
  cupoHabilitado: '',
  finVigencia: '',
}

function validarCampo(name, form, capacidadAula) {
  const v = String(form[name] ?? '').trim()

  if (name === 'aulaId') return v ? '' : 'El aula es obligatoria.'
  if (name === 'materiaId') return v ? '' : 'La materia es obligatoria.'
  if (name === 'docenteId') return v ? '' : 'El docente es obligatorio.'

  if (name === 'cupoHabilitado') {
    if (!v) return 'El cupo habilitado es obligatorio.'
    if (!/^\d+$/.test(v)) return 'Debe ser un número entero.'
    const n = Number(v)
    if (n <= 0) return 'Debe ser un número mayor que 0.'
    if (capacidadAula != null && n > capacidadAula) {
      return `No puede superar la capacidad del aula (${capacidadAula}).`
    }
    return ''
  }

  if (name === 'finVigencia') {
    if (!v) return 'El fin de vigencia es obligatorio.'
    const fecha = new Date(v)
    if (Number.isNaN(fecha.getTime())) return 'La fecha no es válida.'
    if (fecha.getTime() <= Date.now()) return 'Debe ser posterior a la fecha y hora actual.'
    return ''
  }

  return ''
}

export function AsignacionForm({ onClose }) {
  const [opciones, setOpciones] = useState({ aulas: [], materias: [], docentes: [] })
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [touched, setTouched] = useState({})
  const [form, setForm] = useState(FORM_VACIO)

  useEffect(() => {
    const ac = new AbortController()
    getOpcionesAsignacionAula({ signal: ac.signal })
      .then((res) => {
        setOpciones({
          aulas: res?.aulas || [],
          materias: res?.materias || [],
          docentes: res?.docentes || [],
        })
      })
      .catch((error) => {
        if (error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') return
        toastError({
          title: 'Error',
          text: mensajeErrorAsignacion(error, 'No se pudieron cargar aulas, materias o docentes.'),
        })
      })
      .finally(() => setCargando(false))
    return () => ac.abort()
  }, [])

  const aulaSeleccionada = opciones.aulas.find((a) => String(a.id) === form.aulaId)
  const capacidadAula = aulaSeleccionada ? Number(aulaSeleccionada.capacidad) : null

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setTouched((prev) => ({ ...prev, [name]: true }))
  }

  const getFieldClass = (name, base) => {
    const err = validarCampo(name, form, capacidadAula)
    if (!touched[name] && !form[name]) return base
    return `${base} ${err ? 'field-err' : 'field-ok'}`
  }

  const renderError = (name) => {
    const err = validarCampo(name, form, capacidadAula)
    return touched[name] && err ? <div className="emsg">{err}</div> : null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const campos = ['aulaId', 'materiaId', 'docenteId', 'cupoHabilitado', 'finVigencia']
    setTouched(Object.fromEntries(campos.map((k) => [k, true])))

    for (const campo of campos) {
      const err = validarCampo(campo, form, capacidadAula)
      if (err) {
        toastError({ title: 'Validación', text: err })
        return
      }
    }

    setEnviando(true)
    try {
      await createAsignacionAula({
        aulaId: Number(form.aulaId),
        materiaId: Number(form.materiaId),
        docenteId: Number(form.docenteId),
        cupoHabilitado: Number(form.cupoHabilitado),
        // datetime-local → instante UTC para que el backend lo persista sin corrimientos.
        finVigencia: new Date(form.finVigencia).toISOString(),
      })
      toastSuccess({
        text: 'Asignación creada en estado Abierta. Cupos ocupados: 0.',
      })
      onClose(true)
    } catch (error) {
      toastError({
        title: 'Error en el alta',
        text: mensajeErrorAsignacion(error, 'No se pudo crear la asignación.'),
      })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="personasWrap asignacionesWrap">
      <div className="personasPanel personaFormPanel">
        <div className="panelHeader">
          <div>
            <div className="panelTitle">Nueva asignación de aula</div>
            <div className="panelSub">
              El aula, la materia y el docente deben estar activos. El cupo no puede superar la capacidad del aula.
            </div>
          </div>
        </div>

        {cargando ? (
          <div className="emptyState">Cargando opciones...</div>
        ) : (
          <form onSubmit={handleSubmit} className="personaForm" noValidate>
            <h3 className="sectionTitle">Datos del grupo</h3>
            <div className="formGrid">
              <div className="formGroup full-width">
                <label htmlFor="asig-aula">Aula *</label>
                <select
                  id="asig-aula"
                  name="aulaId"
                  className={getFieldClass('aulaId', 'select-field')}
                  value={form.aulaId}
                  onChange={handleChange}
                >
                  <option value="">Seleccioná un aula activa...</option>
                  {opciones.aulas.map((a) => (
                    <option key={a.id} value={String(a.id)}>
                      {a.nombre} (capacidad {a.capacidad})
                    </option>
                  ))}
                </select>
                {renderError('aulaId')}
                {!opciones.aulas.length ? (
                  <div className="asigHint">No hay aulas activas. Creá o reactivá un aula en el catálogo.</div>
                ) : capacidadAula != null ? (
                  <div className="asigHint">Capacidad máxima del aula: {capacidadAula} alumnos.</div>
                ) : null}
              </div>

              <div className="formGroup">
                <label htmlFor="asig-materia">Materia *</label>
                <select
                  id="asig-materia"
                  name="materiaId"
                  className={getFieldClass('materiaId', 'select-field')}
                  value={form.materiaId}
                  onChange={handleChange}
                >
                  <option value="">Seleccioná una materia...</option>
                  {opciones.materias.map((m) => (
                    <option key={m.id} value={String(m.id)}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
                {renderError('materiaId')}
              </div>

              <div className="formGroup">
                <label htmlFor="asig-docente">Docente *</label>
                <select
                  id="asig-docente"
                  name="docenteId"
                  className={getFieldClass('docenteId', 'select-field')}
                  value={form.docenteId}
                  onChange={handleChange}
                >
                  <option value="">Seleccioná un docente...</option>
                  {opciones.docentes.map((d) => (
                    <option key={d.id} value={String(d.id)}>
                      {d.nombreCompleto}{d.dni ? ` · DNI ${d.dni}` : ''}
                    </option>
                  ))}
                </select>
                {renderError('docenteId')}
              </div>

              <div className="formGroup">
                <label htmlFor="asig-cupo">Cupo habilitado *</label>
                <input
                  id="asig-cupo"
                  name="cupoHabilitado"
                  type="number"
                  min="1"
                  max={capacidadAula ?? undefined}
                  step="1"
                  className={getFieldClass('cupoHabilitado', 'input-field')}
                  value={form.cupoHabilitado}
                  onChange={handleChange}
                  placeholder="Ej: 25"
                />
                {renderError('cupoHabilitado')}
              </div>

              <div className="formGroup">
                <label htmlFor="asig-vigencia">Fin de vigencia *</label>
                <input
                  id="asig-vigencia"
                  name="finVigencia"
                  type="datetime-local"
                  min={minFechaHoraLocal()}
                  className={getFieldClass('finVigencia', 'input-field')}
                  value={form.finVigencia}
                  onChange={handleChange}
                />
                {renderError('finVigencia')}
              </div>
            </div>

            {!opciones.materias.length || !opciones.docentes.length ? (
              <div className="asigHint">
                {!opciones.materias.length ? 'No hay materias activas. ' : ''}
                {!opciones.docentes.length ? 'No hay docentes activos.' : ''}
              </div>
            ) : null}

            <div className="formActions">
              <button type="button" className="btn outline" disabled={enviando} onClick={() => onClose(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn primary" disabled={enviando || cargando}>
                {enviando ? 'Guardando…' : 'Crear asignación'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
