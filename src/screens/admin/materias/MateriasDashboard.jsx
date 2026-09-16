import { useEffect, useState } from 'react'
import {
  getMaterias,
  createMateria,
  updateMateria,
  toggleMateriaEstado,
  mensajeErrorMateria,
} from '../../../services/materias'
import { confirmDialog, toastSuccess, toastError } from '../../../lib/alerts'
import '../personas/personas.css'
import './materiasDashboard.css'

const FORM_VACIO = {
  nombre: '',
  area: '',
  descripcion: '',
  duracionHoras: '0',
  precioPorClase: '0',
  activa: true,
}

function toForm(m) {
  return {
    nombre: m?.nombre || m?.Nombre || '',
    area: m?.area || m?.Area || '',
    descripcion: m?.descripcion || m?.Descripcion || '',
    duracionHoras: String(m?.duracionHoras ?? m?.DuracionHoras ?? 0),
    precioPorClase: String(m?.precioPorClase ?? m?.PrecioPorClase ?? 0),
    activa: m?.activa ?? m?.Activa ?? true,
  }
}

export function MateriasDashboard() {
  const [materias, setMaterias] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterEstado, setFilterEstado] = useState('activo')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(FORM_VACIO)
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
      const res = await getMaterias({
        buscar,
        estado,
        pagina,
        limite: 10,
      })
      setMaterias(res.datos || [])
      setPaginaActual(res.paginaActual || 1)
      setPaginasTotales(res.paginasTotales || 1)
      setTotalRegistros(res.totalRegistros || 0)
    } catch (error) {
      setMaterias([])
      toastError({ title: 'Error', text: mensajeErrorMateria(error, 'No se pudieron cargar las materias.') })
    } finally {
      setLoading(false)
    }
  }

  const abrirAlta = () => {
    setEditing(null)
    setForm(FORM_VACIO)
    setShowForm(true)
  }

  const abrirEdicion = (m) => {
    setEditing(m)
    setForm(toForm(m))
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const nombre = form.nombre.trim()
    if (!nombre) {
      toastError({ title: 'Validación', text: 'El nombre es obligatorio.' })
      return
    }

    const payload = {
      nombre,
      area: form.area.trim() || null,
      descripcion: form.descripcion.trim() || null,
      duracionHoras: Number(form.duracionHoras) || 0,
      precioPorClase: Number(form.precioPorClase) || 0,
      activa: !!form.activa,
    }

    setEnviando(true)
    try {
      if (editing) {
        await updateMateria(editing.id, payload)
        toastSuccess({ text: 'Materia actualizada.' })
      } else {
        await createMateria(payload)
        toastSuccess({ text: 'Materia registrada.' })
      }
      setShowForm(false)
      setEditing(null)
      fetchData({ pagina: editing ? paginaActual : 1 })
    } catch (error) {
      toastError({
        title: editing ? 'Error al guardar' : 'Error en el alta',
        text: mensajeErrorMateria(error, 'No se pudo guardar la materia.'),
      })
    } finally {
      setEnviando(false)
    }
  }

  const handleToggleEstado = async (m) => {
    const activa = m.activa ?? m.Activa
    const nombre = m.nombre || m.Nombre
    const confirmado = await confirmDialog(
      activa
        ? {
            title: 'Desactivar materia',
            text: `¿Desactivar "${nombre}"? Dejará de aparecer en inscripciones y en la asignación a profesores.`,
            confirmText: 'Sí, desactivar',
            cancelText: 'Cancelar',
            danger: true,
          }
        : {
            title: 'Activar materia',
            text: `¿Reactivar "${nombre}"?`,
            confirmText: 'Sí, activar',
            cancelText: 'Cancelar',
          },
    )
    if (!confirmado) return

    try {
      await toggleMateriaEstado(m.id)
      toastSuccess({ text: activa ? 'Materia desactivada.' : 'Materia activada.' })
      fetchData({ pagina: paginaActual })
    } catch (error) {
      toastError({ title: 'Error', text: mensajeErrorMateria(error, 'No se pudo cambiar el estado.') })
    }
  }

  if (showForm) {
    return (
      <div className="personasWrap materiasWrap">
        <div className="personasPanel personaFormContainer">
          <div className="panelHeader">
            <div>
              <div className="panelTitle">{editing ? 'Editar materia' : 'Alta de materia'}</div>
              <div className="panelSub">
                Las materias activas se usan en inscripciones y en la asignación a profesores.
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="personaForm" noValidate>
            <div className="formGrid">
              <div className="formGroup full-width">
                <label htmlFor="mat-nombre">Nombre *</label>
                <input
                  id="mat-nombre"
                  className="input-field"
                  value={form.nombre}
                  onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
                  placeholder="Ej: Matemática"
                />
              </div>
              <div className="formGroup full-width">
                <label htmlFor="mat-area">Área</label>
                <input
                  id="mat-area"
                  className="input-field"
                  value={form.area}
                  onChange={(e) => setForm((p) => ({ ...p, area: e.target.value }))}
                  placeholder="Ej: Ciencias exactas"
                  list="areas-sugeridas"
                />
                <datalist id="areas-sugeridas">
                  <option value="Ciencias exactas" />
                  <option value="Área de Ciencias Sociales" />
                  <option value="Área de Ciencias Naturales" />
                </datalist>
              </div>
              <div className="formGroup full-width">
                <label htmlFor="mat-desc">Descripción</label>
                <textarea
                  id="mat-desc"
                  className="input-field"
                  rows={3}
                  value={form.descripcion}
                  onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
                />
              </div>
              <div className="formGroup">
                <label htmlFor="mat-horas">Duración (horas)</label>
                <input
                  id="mat-horas"
                  type="number"
                  min="0"
                  className="input-field"
                  value={form.duracionHoras}
                  onChange={(e) => setForm((p) => ({ ...p, duracionHoras: e.target.value }))}
                />
              </div>
              <div className="formGroup">
                <label htmlFor="mat-precio">Precio por clase</label>
                <input
                  id="mat-precio"
                  type="number"
                  min="0"
                  step="0.01"
                  className="input-field"
                  value={form.precioPorClase}
                  onChange={(e) => setForm((p) => ({ ...p, precioPorClase: e.target.value }))}
                />
              </div>
              <div className="formGroup">
                <label htmlFor="mat-activa">Estado</label>
                <select
                  id="mat-activa"
                  className="select-field"
                  value={form.activa ? 'activa' : 'inactiva'}
                  onChange={(e) => setForm((p) => ({ ...p, activa: e.target.value === 'activa' }))}
                >
                  <option value="activa">Activa</option>
                  <option value="inactiva">Inactiva</option>
                </select>
              </div>
            </div>

            <div className="formActions">
              <button
                type="button"
                className="btn outline"
                disabled={enviando}
                onClick={() => {
                  setShowForm(false)
                  setEditing(null)
                }}
              >
                Cancelar
              </button>
              <button type="submit" className="btn primary" disabled={enviando}>
                {enviando ? 'Guardando…' : editing ? 'Guardar cambios' : 'Registrar materia'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="personasWrap materiasWrap">
      <div className="personasPanel">
        <div className="panelHeader">
          <div>
            <div className="panelTitle">Materias</div>
            <div className="panelSub">Catálogo de materias del instituto (origen para inscripciones y profesores)</div>
          </div>
          <button type="button" className="btn primary" onClick={abrirAlta}>
            + Nueva materia
          </button>
        </div>

        <div className="filtersRow">
          <input
            className="search input-field"
            placeholder="Buscar por nombre, área o descripción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="select-field"
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
          >
            <option value="todos">Todos los estados</option>
            <option value="activo">Activas</option>
            <option value="inactivo">Inactivas</option>
          </select>
        </div>

        <div className="tableContainer">
          {loading ? (
            <div className="emptyState">Cargando materias...</div>
          ) : (
            <table className="personasTable">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Área</th>
                  <th>Horas</th>
                  <th>Precio/clase</th>
                  <th>Estado</th>
                  <th className="actions-col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {materias.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="emptyState">No se encontraron materias con los filtros actuales.</td>
                  </tr>
                ) : (
                  materias.map((m) => {
                    const activa = m.activa ?? m.Activa
                    return (
                      <tr key={m.id} className={activa ? '' : 'row-inactive'}>
                        <td className="fw-600">{m.nombre}</td>
                        <td>{m.area || '—'}</td>
                        <td>{m.duracionHoras ?? 0}</td>
                        <td>
                          {Number(m.precioPorClase || 0).toLocaleString('es-AR', {
                            style: 'currency',
                            currency: 'ARS',
                          })}
                        </td>
                        <td>
                          <span className={`badge ${activa ? 'activa' : 'cancelada'}`}>
                            {activa ? 'Activa' : 'Inactiva'}
                          </span>
                        </td>
                        <td className="actions-col">
                          <button type="button" className="btn-icon" title="Editar" onClick={() => abrirEdicion(m)}>
                            ✎
                          </button>
                          <button
                            type="button"
                            className={`btn-icon ${activa ? 'danger' : ''}`}
                            title={activa ? 'Desactivar' : 'Activar'}
                            onClick={() => handleToggleEstado(m)}
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
            Mostrando {materias.length} de {totalRegistros} registros (Pág. {paginaActual} de {paginasTotales})
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
