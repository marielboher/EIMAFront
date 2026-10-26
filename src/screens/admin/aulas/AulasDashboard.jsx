import { useEffect, useState } from 'react'
import {
  getAulas,
  createAula,
  updateAula,
  toggleAulaEstado,
  mensajeErrorAula,
} from '../../../services/aulas'
import { confirmDialog, toastSuccess, toastError } from '../../../lib/alerts'
import '../personas/personas.css'
import '../materias/materiasDashboard.css'
import './aulasDashboard.css'

const FORM_VACIO = {
  nombre: '',
  capacidad: '',
  ubicacion: '',
}

function validarNombre(valor) {
  return String(valor ?? '').trim() ? '' : 'El nombre es obligatorio.'
}

function validarCapacidad(valor) {
  const v = String(valor ?? '').trim()
  if (!v) return 'La capacidad es obligatoria.'
  if (!/^\d+$/.test(v)) return 'La capacidad debe ser un número entero.'
  if (Number(v) <= 0) return 'La capacidad debe ser mayor que 0.'
  return ''
}

function toForm(aula) {
  return {
    nombre: aula?.nombre || aula?.Nombre || '',
    capacidad: String(aula?.capacidad ?? aula?.Capacidad ?? ''),
    ubicacion: aula?.ubicacion || aula?.Ubicacion || '',
  }
}

export function AulasDashboard() {
  const [aulas, setAulas] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterEstado, setFilterEstado] = useState('todas')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(FORM_VACIO)
  const [touched, setTouched] = useState({})
  const [enviando, setEnviando] = useState(false)

  const [paginaActual, setPaginaActual] = useState(1)
  const [paginasTotales, setPaginasTotales] = useState(1)
  const [totalRegistros, setTotalRegistros] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => {
      fetchData({ pagina: 1, buscar: search, estado: filterEstado })
    }, 350)
    return () => clearTimeout(t)
  }, [search, filterEstado])

  const fetchData = async (options = {}) => {
    setLoading(true)
    const buscar = options.buscar !== undefined ? options.buscar : search
    const estado = options.estado !== undefined ? options.estado : filterEstado
    const pagina = options.pagina !== undefined ? options.pagina : paginaActual
    try {
      const res = await getAulas({ buscar, estado, pagina, limite: 10 })
      setAulas(res.datos || [])
      setPaginaActual(res.paginaActual || 1)
      setPaginasTotales(res.paginasTotales || 1)
      setTotalRegistros(res.totalRegistros || 0)
    } catch (error) {
      setAulas([])
      toastError({ title: 'Error', text: mensajeErrorAula(error, 'No se pudieron cargar las aulas.') })
    } finally {
      setLoading(false)
    }
  }

  const abrirAlta = () => {
    setEditing(null)
    setForm(FORM_VACIO)
    setTouched({})
    setShowForm(true)
  }

  const abrirEdicion = (aula) => {
    setEditing(aula)
    setForm(toForm(aula))
    setTouched({})
    setShowForm(true)
  }

  const cerrarForm = () => {
    setShowForm(false)
    setEditing(null)
    setTouched({})
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setTouched((prev) => ({ ...prev, [name]: true }))
  }

  const getInputClass = (name) => {
    const err = name === 'nombre' ? validarNombre(form.nombre) : validarCapacidad(form.capacidad)
    if (!touched[name] && !form[name]) return 'input-field'
    return err ? 'input-field field-err' : 'input-field field-ok'
  }

  const renderError = (name) => {
    const err = name === 'nombre' ? validarNombre(form.nombre) : validarCapacidad(form.capacidad)
    return touched[name] && err ? <div className="emsg">{err}</div> : null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({ nombre: true, capacidad: true })

    const errNombre = validarNombre(form.nombre)
    const errCapacidad = validarCapacidad(form.capacidad)
    if (errNombre || errCapacidad) {
      toastError({ title: 'Validación', text: errNombre || errCapacidad })
      return
    }

    const payload = {
      nombre: form.nombre.trim(),
      capacidad: Number(form.capacidad),
      ubicacion: form.ubicacion.trim() || null,
    }

    setEnviando(true)
    try {
      if (editing) {
        await updateAula(editing.id, payload)
        toastSuccess({ text: 'Aula actualizada.' })
      } else {
        await createAula(payload)
        toastSuccess({ text: 'Aula creada en estado Activa.' })
      }
      cerrarForm()
      fetchData({ pagina: editing ? paginaActual : 1 })
    } catch (error) {
      toastError({
        title: editing ? 'Error al guardar' : 'Error en el alta',
        text: mensajeErrorAula(error, 'No se pudo guardar el aula.'),
      })
    } finally {
      setEnviando(false)
    }
  }

  const handleToggleEstado = async (aula) => {
    const activa = aula.activa ?? aula.Activa
    const nombre = aula.nombre || aula.Nombre
    const abiertas = Number(aula.asignacionesAbiertas ?? aula.AsignacionesAbiertas ?? 0)

    if (activa && abiertas > 0) {
      toastError({
        title: 'Inactivación bloqueada',
        text: `El aula "${nombre}" tiene ${abiertas} asignación(es) abierta(s). Cerrá o reasigná esas asignaciones antes.`,
      })
      return
    }

    const confirmado = await confirmDialog(
      activa
        ? {
            title: 'Inactivar aula',
            text: `¿Inactivar "${nombre}"? Dejará de ofrecerse en el alta de asignaciones, pero seguirá visible en el catálogo.`,
            confirmText: 'Sí, inactivar',
            cancelText: 'Cancelar',
            danger: true,
          }
        : {
            title: 'Reactivar aula',
            text: `¿Reactivar "${nombre}"? Volverá a estar disponible para asignar.`,
            confirmText: 'Sí, reactivar',
            cancelText: 'Cancelar',
          },
    )
    if (!confirmado) return

    try {
      await toggleAulaEstado(aula.id)
      toastSuccess({ text: activa ? 'Aula inactivada.' : 'Aula reactivada.' })
      fetchData({ pagina: paginaActual })
    } catch (error) {
      toastError({
        title: 'No se pudo cambiar el estado',
        text: mensajeErrorAula(error, 'No se pudo cambiar el estado del aula.'),
      })
    }
  }

  if (showForm) {
    return (
      <div className="personasWrap aulasWrap">
        <div className="personasPanel personaFormPanel">
          <div className="panelHeader">
            <div>
              <div className="panelTitle">{editing ? 'Editar aula' : 'Alta de aula'}</div>
              <div className="panelSub">
                Las aulas activas se ofrecen al crear una asignación y su capacidad es el tope del cupo.
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="personaForm" noValidate>
            <div className="formGrid">
              <div className="formGroup full-width">
                <label htmlFor="aula-nombre">Nombre *</label>
                <input
                  id="aula-nombre"
                  name="nombre"
                  className={getInputClass('nombre')}
                  value={form.nombre}
                  onChange={handleChange}
                  maxLength={150}
                  placeholder="Ej: Aula 1"
                />
                {renderError('nombre')}
              </div>

              <div className="formGroup">
                <label htmlFor="aula-capacidad">Capacidad *</label>
                <input
                  id="aula-capacidad"
                  name="capacidad"
                  type="number"
                  min="1"
                  step="1"
                  className={getInputClass('capacidad')}
                  value={form.capacidad}
                  onChange={handleChange}
                  placeholder="Ej: 30"
                />
                {renderError('capacidad')}
              </div>

              <div className="formGroup">
                <label htmlFor="aula-ubicacion">Ubicación</label>
                <input
                  id="aula-ubicacion"
                  name="ubicacion"
                  className="input-field"
                  value={form.ubicacion}
                  onChange={handleChange}
                  maxLength={200}
                  placeholder="Ej: Planta baja"
                />
              </div>
            </div>

            <div className="formActions">
              <button type="button" className="btn outline" disabled={enviando} onClick={cerrarForm}>
                Cancelar
              </button>
              <button type="submit" className="btn primary" disabled={enviando}>
                {enviando ? 'Guardando…' : editing ? 'Guardar cambios' : 'Registrar aula'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="personasWrap aulasWrap">
      <div className="personasPanel">
        <div className="panelHeader">
          <div>
            <div className="panelTitle">Aulas</div>
            <div className="panelSub">Catálogo de aulas del instituto (origen para las asignaciones)</div>
          </div>
          <button type="button" className="btn primary" onClick={abrirAlta}>
            + Nueva aula
          </button>
        </div>

        <div className="filtersRow">
          <input
            className="search input-field"
            placeholder="Buscar por nombre o ubicación..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="select-field"
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
          >
            <option value="todas">Todos los estados</option>
            <option value="activa">Activas</option>
            <option value="inactiva">Inactivas</option>
          </select>
        </div>

        <div className="tableContainer">
          {loading ? (
            <div className="emptyState">Cargando aulas...</div>
          ) : (
            <table className="personasTable">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Capacidad</th>
                  <th>Ubicación</th>
                  <th>Estado</th>
                  <th className="actions-col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {aulas.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="emptyState">No se encontraron aulas con los filtros actuales.</td>
                  </tr>
                ) : (
                  aulas.map((aula) => {
                    const activa = aula.activa ?? aula.Activa
                    const abiertas = Number(aula.asignacionesAbiertas ?? aula.AsignacionesAbiertas ?? 0)
                    const bloqueada = activa && abiertas > 0
                    return (
                      <tr key={aula.id} className={activa ? '' : 'row-inactive'}>
                        <td className="fw-600">{aula.nombre}</td>
                        <td>{aula.capacidad}</td>
                        <td>{aula.ubicacion || '—'}</td>
                        <td>
                          <span className={`badge ${activa ? 'activa' : 'inactiva'}`}>
                            {activa ? 'Activa' : 'Inactiva'}
                          </span>
                        </td>
                        <td className="actions-col">
                          <button
                            type="button"
                            className="btn-icon"
                            title="Editar"
                            onClick={() => abrirEdicion(aula)}
                          >
                            ✎
                          </button>
                          <button
                            type="button"
                            className={`btn-icon ${activa ? 'danger' : ''}`}
                            title={
                              bloqueada
                                ? 'No se puede inactivar: tiene asignaciones abiertas'
                                : activa
                                  ? 'Inactivar'
                                  : 'Reactivar'
                            }
                            onClick={() => handleToggleEstado(aula)}
                          >
                            {activa ? '🚫' : '✓'}
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="pagination">
          <span>
            Mostrando {aulas.length} de {totalRegistros} registros (Pág. {paginaActual} de {paginasTotales})
          </span>
          <div className="pagination-controls">
            <button
              type="button"
              className="btn outline small"
              disabled={paginaActual <= 1}
              onClick={() => fetchData({ pagina: paginaActual - 1 })}
            >
              Anterior
            </button>
            <button
              type="button"
              className="btn outline small"
              disabled={paginaActual >= paginasTotales}
              onClick={() => fetchData({ pagina: paginaActual + 1 })}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
