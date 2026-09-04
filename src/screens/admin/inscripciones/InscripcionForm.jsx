import { useState } from 'react'
import { toastError, toastSuccess } from '../../../lib/alerts'
import { ESTADOS_INSCRIPCION, nombreAlumno, nombreMateria } from './inscripcionHelpers'
import { ALUMNOS_MOCK, MATERIAS_MOCK, createInscripcionMock, updateInscripcionMock } from './inscripcionesMock'
import '../personas/personas.css'
import './inscripciones.css'

function validateField(name, value) {
  const v = String(value ?? '').trim()
  if (name === 'personaId') return v ? '' : 'El alumno es obligatorio.'
  if (name === 'materiaId') return v ? '' : 'La materia es obligatoria.'
  if (name === 'clasesTotales') {
    if (!v) return 'La cantidad de clases contratadas es obligatoria.'
    if (!/^\d+$/.test(v)) return 'Debe ser un número entero.'
    if (Number(v) <= 0) return 'Debe ser un número mayor a cero.'
    return ''
  }
  if (name === 'clasesTomadas') {
    if (v === '') return ''
    if (!/^\d+$/.test(v)) return 'Debe ser un número entero.'
    if (Number(v) < 0) return 'No puede ser negativo.'
    return ''
  }
  if (name === 'estado') return v ? '' : 'El estado es obligatorio.'
  return ''
}

export function InscripcionForm({ inscripcion, onClose }) {
  const isEditing = !!inscripcion

  const alumnos = ALUMNOS_MOCK.filter((a) => a.activo)
  const materias = MATERIAS_MOCK.filter((m) => m.activa)
  const [touched, setTouched] = useState({})
  const [formData, setFormData] = useState({
    personaId: String(inscripcion?.personaId || inscripcion?.PersonaId || ''),
    materiaId: String(inscripcion?.materiaId || inscripcion?.MateriaId || ''),
    clasesTotales: String(inscripcion?.clasesTotales ?? inscripcion?.ClasesTotales ?? ''),
    clasesTomadas: String(inscripcion?.clasesTomadas ?? inscripcion?.ClasesTomadas ?? '0'),
    estado: inscripcion?.estado || inscripcion?.Estado || 'Activa',
  })

  const handleBlur = (e) => setTouched((prev) => ({ ...prev, [e.target.name]: true }))

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setTouched((prev) => ({ ...prev, [name]: true }))
  }

  const getInputClass = (name) => {
    const err = validateField(name, formData[name])
    if (!touched[name] && !formData[name]) return 'input-field'
    return err ? 'input-field field-err' : 'input-field field-ok'
  }

  const getSelectClass = (name) => {
    const err = validateField(name, formData[name])
    if (!touched[name] && !formData[name]) return 'select-field'
    return err ? 'select-field field-err' : 'select-field field-ok'
  }

  const renderError = (name) => {
    const err = validateField(name, formData[name])
    return touched[name] && err ? <div className="emsg">{err}</div> : null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fields = isEditing
      ? ['clasesTotales', 'clasesTomadas', 'estado']
      : ['personaId', 'materiaId', 'clasesTotales']
    setTouched((prev) => ({ ...prev, ...Object.fromEntries(fields.map((k) => [k, true])) }))

    for (const f of fields) {
      const err = validateField(f, formData[f])
      if (err) {
        toastError({ title: 'Validación', text: err })
        return
      }
    }

    if (isEditing) {
      const tomadas = Number(formData.clasesTomadas)
      const totales = Number(formData.clasesTotales)
      if (tomadas > totales) {
        toastError({ title: 'Validación', text: 'Las clases tomadas no pueden superar las contratadas.' })
        return
      }
    }

    try {
      if (isEditing) {
        updateInscripcionMock(inscripcion.id, {
          clasesTotales: Number(formData.clasesTotales),
          clasesTomadas: Number(formData.clasesTomadas),
          estado: formData.estado,
        })
        toastSuccess({ text: 'Inscripción actualizada.' })
        onClose(true)
      } else {
        createInscripcionMock({
          personaId: Number(formData.personaId),
          materiaId: Number(formData.materiaId),
          clasesTotales: Number(formData.clasesTotales),
        })
        toastSuccess({ text: 'Inscripción registrada. Estado Activa, clases tomadas 0 y monto pagado $0.' })
        onClose(true)
      }
    } catch (error) {
      toastError({
        title: isEditing ? 'Error al guardar' : 'Error en el alta',
        text: error.message || 'No se pudo guardar la inscripción.',
      })
    }
  }

  return (
    <div className="personasWrap inscripcionesWrap">
      <div className="personasPanel personaFormPanel">
        <div className="panelHeader">
          <div>
            <div className="panelTitle">{isEditing ? 'Editar inscripción' : 'Alta de inscripción'}</div>
            <div className="panelSub">
              {isEditing
                ? 'Modificá el estado y el progreso de la cursada.'
                : 'Inscribí a un alumno en una materia para habilitar clases y pagos.'}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="personaForm" noValidate>
          <h3 className="sectionTitle">Datos de la cursada</h3>
          <div className="formGrid">
            <div className="formGroup full-width">
              <label>Alumno *</label>
              {isEditing ? (
                <div className="inscReadonly">
                  {nombreAlumno(inscripcion)}
                  {(inscripcion.alumnoDni || inscripcion.persona?.dni) ? ` · DNI ${inscripcion.alumnoDni || inscripcion.persona?.dni}` : ''}
                </div>
              ) : (
                <>
                  <select
                    name="personaId"
                    value={formData.personaId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getSelectClass('personaId')}
                  >
                    <option value="">Seleccioná un alumno activo…</option>
                    {alumnos.map((a) => (
                      <option key={a.id || a.Id} value={String(a.id || a.Id)}>
                        {(a.apellido || a.Apellido || '')}, {(a.nombre || a.Nombre || '')} · DNI {a.dni || a.Dni}
                      </option>
                    ))}
                  </select>
                  {renderError('personaId')}
                </>
              )}
            </div>

            <div className="formGroup full-width">
              <label>Materia *</label>
              {isEditing ? (
                <div className="inscReadonly">{nombreMateria(inscripcion)}</div>
              ) : (
                <>
                  <select
                    name="materiaId"
                    value={formData.materiaId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getSelectClass('materiaId')}
                  >
                    <option value="">Seleccioná una materia activa…</option>
                    {materias.map((m) => (
                      <option key={m.id || m.Id} value={String(m.id || m.Id)}>
                        {m.nombre || m.Nombre}{m.area || m.Area ? ` — ${m.area || m.Area}` : ''}
                      </option>
                    ))}
                  </select>
                  {renderError('materiaId')}
                </>
              )}
            </div>

            <div className="formGroup">
              <label>Clases contratadas *</label>
              <input
                name="clasesTotales"
                inputMode="numeric"
                value={formData.clasesTotales}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClass('clasesTotales')}
                placeholder="Ej: 8"
              />
              {renderError('clasesTotales')}
            </div>

            {isEditing && (
              <>
                <div className="formGroup">
                  <label>Clases tomadas</label>
                  <input
                    name="clasesTomadas"
                    inputMode="numeric"
                    value={formData.clasesTomadas}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getInputClass('clasesTomadas')}
                  />
                  {renderError('clasesTomadas')}
                </div>
                <div className="formGroup full-width">
                  <label>Estado *</label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getSelectClass('estado')}
                  >
                    {ESTADOS_INSCRIPCION.map((e) => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                  {renderError('estado')}
                </div>
              </>
            )}
          </div>

          {!isEditing && (
            <p className="inscHint">
              Al confirmar, la inscripción se crea con estado Activa, clases tomadas en 0, monto pagado en $0
              y fecha de inscripción del día de hoy.
            </p>
          )}

          <div className="formActions">
            <button type="button" className="btn outline" onClick={() => onClose(false)}>Cancelar</button>
            <button type="submit" className="btn primary">
              {isEditing ? 'Guardar cambios' : 'Registrar inscripción'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
