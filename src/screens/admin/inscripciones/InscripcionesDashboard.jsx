import { useEffect, useState } from 'react'
import { InscripcionForm } from './InscripcionForm'
import { InscripcionDetailModal } from './InscripcionDetailModal'
import {
  listInscripcionesMock,
  getInscripcionMockById,
  darDeBajaInscripcionMock,
  MATERIAS_MOCK,
  textoAdvertenciaBaja,
} from './inscripcionesMock'
import { confirmDialog, toastSuccess, toastError } from '../../../lib/alerts'
import {
  ESTADOS_INSCRIPCION,
  claseBadgeEstado,
  formatFecha,
  formatMonto,
  nombreAlumno,
  nombreMateria,
  puedeDarDeBaja,
  inscripcionYaInactiva,
} from './inscripcionHelpers'
import '../personas/personas.css'
import './inscripciones.css'

export function InscripcionesDashboard() {
  const [inscripciones, setInscripciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterEstado, setFilterEstado] = useState('Activa')
  const [filterMateria, setFilterMateria] = useState('todos')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [detalle, setDetalle] = useState(null)

  const [paginaActual, setPaginaActual] = useState(1)
  const [paginasTotales, setPaginasTotales] = useState(1)
  const [totalRegistros, setTotalRegistros] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => {
      fetchData({ pagina: 1, buscar: search, estado: filterEstado, materiaId: filterMateria })
    }, 350)
    return () => clearTimeout(t)
  }, [search, filterEstado, filterMateria])

  const fetchData = (options = {}) => {
    setLoading(true)
    const estado = options.estado !== undefined ? options.estado : filterEstado
    const buscar = options.buscar !== undefined ? options.buscar : search
    const materiaId = options.materiaId !== undefined ? options.materiaId : filterMateria
    const pagina = options.pagina !== undefined ? options.pagina : paginaActual
    const res = listInscripcionesMock({
      estado,
      buscar,
      materiaId,
      pagina,
      limite: 5,
    })
    setInscripciones(res.datos || [])
    setPaginaActual(res.paginaActual || 1)
    setPaginasTotales(res.paginasTotales || 1)
    setTotalRegistros(res.totalRegistros || 0)
    setLoading(false)
  }

  const abrirDetalle = (row) => {
    const full = getInscripcionMockById(row.id) || row
    setDetalle(full)
  }

  const handleRowClick = (e, row) => {
    if (e.target.closest('.btn-icon') || e.target.closest('.actions-col')) return
    abrirDetalle(row)
  }

  const handleDarDeBaja = async (row) => {
    const actual = getInscripcionMockById(row.id) || row
    const estado = actual.estado

    if (inscripcionYaInactiva(estado)) {
      toastError({
        title: 'Inscripción inactiva',
        text: 'La inscripción ya se encuentra inactiva.',
      })
      return
    }

    if (!puedeDarDeBaja(estado)) {
      toastError({ title: 'No disponible', text: 'La baja solo está habilitada si el estado es Activa o Suspendida.' })
      return
    }

    const advertenciaPagos = textoAdvertenciaBaja(actual)
    const confirmado = await confirmDialog({
      title: 'Dar de baja',
      text: [
        'Esta operación no elimina el registro: lo inactiva (Estado = Cancelada).',
        'Se conservan las clases tomadas, el monto pagado y el historial de pagos.',
        advertenciaPagos,
      ].filter(Boolean).join(' '),
      confirmText: 'Sí, dar de baja',
      cancelText: 'Cancelar',
      danger: true,
    })
    if (!confirmado) return

    try {
      const actualizada = darDeBajaInscripcionMock(actual.id)
      toastSuccess({ text: 'La inscripción quedó Cancelada (baja lógica).' })
      fetchData({ pagina: paginaActual })
      setDetalle((prev) => (prev && prev.id === actualizada.id ? actualizada : prev))
    } catch (error) {
      toastError({ title: 'No se pudo dar de baja', text: error.message || 'La inscripción ya se encuentra inactiva.' })
    }
  }

  if (showForm) {
    return (
      <InscripcionForm
        inscripcion={editing}
        onClose={(huboCambios) => {
          setShowForm(false)
          setEditing(null)
          if (huboCambios === true) fetchData({ pagina: paginaActual })
        }}
      />
    )
  }

  return (
    <div className="personasWrap inscripcionesWrap">
      <div className="personasPanel">
        <div className="panelHeader">
          <div>
            <div className="panelTitle">Inscripciones</div>
            <div className="panelSub">Consulta y gestión de cursadas de alumnos (datos de prueba)</div>
          </div>
          <button
            className="btn primary"
            onClick={() => {
              setEditing(null)
              setShowForm(true)
            }}
          >
            + Nueva inscripción
          </button>
        </div>

        <div className="filtersRow">
          <input
            className="search input-field"
            placeholder="Buscar por alumno (nombre, apellido o DNI)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="select-field" value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}>
            <option value="todos">Todos los estados</option>
            {ESTADOS_INSCRIPCION.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
          <select className="select-field" value={filterMateria} onChange={(e) => setFilterMateria(e.target.value)}>
            <option value="todos">Todas las materias</option>
            {MATERIAS_MOCK.map((m) => (
              <option key={m.id} value={String(m.id)}>
                {m.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="tableContainer">
          {loading ? (
            <div className="emptyState">Cargando inscripciones...</div>
          ) : (
            <table className="personasTable">
              <thead>
                <tr>
                  <th>Alumno</th>
                  <th>Materia</th>
                  <th>Fecha inscripción</th>
                  <th>Clases</th>
                  <th>Estado</th>
                  <th>Monto pagado</th>
                  <th className="actions-col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {inscripciones.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="emptyState">No se encontraron inscripciones con los filtros actuales.</td>
                  </tr>
                ) : (
                  inscripciones.map((row) => {
                    const estado = row.estado
                    const bajaHabilitada = puedeDarDeBaja(estado)
                    return (
                      <tr
                        key={row.id}
                        className={inscripcionYaInactiva(estado) ? 'row-inactive' : ''}
                        onClick={(e) => handleRowClick(e, row)}
                      >
                        <td className="fw-600">
                          {nombreAlumno(row)}
                          {row.alumnoDni ? <div className="pagoItemMeta">DNI {row.alumnoDni}</div> : null}
                        </td>
                        <td>{nombreMateria(row)}</td>
                        <td>{formatFecha(row.fechaInscripcion)}</td>
                        <td className="clasesCell">{row.clasesTomadas}/{row.clasesTotales}</td>
                        <td>
                          <span className={`badge ${claseBadgeEstado(estado)}`}>{estado}</span>
                        </td>
                        <td>{formatMonto(row.montoPagado)}</td>
                        <td className="actions-col">
                          <button className="btn-icon" title="Ver detalle" onClick={() => abrirDetalle(row)}>
                            👁
                          </button>
                          <button
                            className="btn-icon"
                            title="Editar"
                            onClick={() => {
                              setEditing(row)
                              setShowForm(true)
                            }}
                          >
                            ✎
                          </button>
                          <button
                            className={`btn-icon ${bajaHabilitada ? 'danger' : ''}`}
                            title={bajaHabilitada ? 'Dar de baja' : 'Dar de baja (no disponible)'}
                            onClick={() => handleDarDeBaja(row)}
                          >
                            🚫
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
            Mostrando {inscripciones.length} de {totalRegistros} registros (Pág. {paginaActual} de {paginasTotales})
          </span>
          <div className="pagination-controls">
            <button
              className="btn outline small"
              disabled={paginaActual <= 1}
              onClick={() => fetchData({ pagina: paginaActual - 1 })}
            >
              Anterior
            </button>
            <button
              className="btn outline small"
              disabled={paginaActual >= paginasTotales}
              onClick={() => fetchData({ pagina: paginaActual + 1 })}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {detalle && (
        <InscripcionDetailModal
          inscripcion={detalle}
          onClose={() => setDetalle(null)}
          onPagoRegistrado={(actualizada) => {
            // CA05 — detalle e historial actualizados + monto en listado
            setDetalle(actualizada)
            fetchData({ pagina: paginaActual })
          }}
          onDarDeBaja={() => handleDarDeBaja(detalle)}
        />
      )}
    </div>
  )
}
