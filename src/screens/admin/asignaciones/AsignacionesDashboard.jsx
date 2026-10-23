import { useEffect, useRef, useState } from 'react'
import { AsignacionForm } from './AsignacionForm'
import { AsignacionDetailModal } from './AsignacionDetailModal'
import {
  getAsignacionesAula,
  getAsignacionAulaById,
  getOpcionesAsignacionAula,
  cerrarAsignacionAula,
  getVistasAsignaciones,
  guardarVistaAsignaciones,
  eliminarVistaAsignaciones,
  exportarAsignacionesAula,
  mensajeErrorAsignacion,
} from '../../../services/asignacionesAula'
import { confirmDialog, inputDialog, toastSuccess, toastError } from '../../../lib/alerts'
import { descargarArchivo } from '../../../lib/download'
import {
  formatFechaHora,
  fechaIsoAInput,
  inputAFechaIso,
  textoCupo,
  claseBadgeEstado,
  esAbierta,
} from './asignacionHelpers'
import '../personas/personas.css'
import './asignacionesAula.css'

const LIMITE_POR_PAGINA = 25
const CLAVE_VISTA = 'eima.asignaciones.vistaActiva'
const ORDEN_INICIAL = { campo: 'fechaAsignacion', direccion: 'desc' }

function leerVistaGuardada() {
  try {
    const crudo = localStorage.getItem(CLAVE_VISTA)
    return crudo ? JSON.parse(crudo) : null
  } catch {
    return null
  }
}

function normalizarOrden(orden) {
  return orden?.campo
    ? { campo: orden.campo, direccion: orden.direccion === 'asc' ? 'asc' : 'desc' }
    : ORDEN_INICIAL
}

export function AsignacionesDashboard() {
  const [vistaGuardada] = useState(leerVistaGuardada)
  const [asignaciones, setAsignaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(vistaGuardada?.filtros?.buscar ?? '')
  const [filterEstado, setFilterEstado] = useState(vistaGuardada?.filtros?.estado ?? 'todos')
  const [filterMateria, setFilterMateria] = useState(
    vistaGuardada?.filtros?.materiaId ? String(vistaGuardada.filtros.materiaId) : 'todos',
  )
  const [filterDocente, setFilterDocente] = useState(
    vistaGuardada?.filtros?.docenteId ? String(vistaGuardada.filtros.docenteId) : 'todos',
  )
  const [desde, setDesde] = useState(fechaIsoAInput(vistaGuardada?.filtros?.vigenciaDesde))
  const [hasta, setHasta] = useState(fechaIsoAInput(vistaGuardada?.filtros?.vigenciaHasta))
  const [orden, setOrden] = useState(normalizarOrden(vistaGuardada?.orden))
  const [vistas, setVistas] = useState([])
  const [vistaActiva, setVistaActiva] = useState(
    vistaGuardada?.id ? String(vistaGuardada.id) : '',
  )
  const [exportando, setExportando] = useState('')
  const [opciones, setOpciones] = useState({ materias: [], docentes: [] })
  const [showForm, setShowForm] = useState(false)
  const [detalle, setDetalle] = useState(null)
  const [cerrandoId, setCerrandoId] = useState(null)

  const [paginaActual, setPaginaActual] = useState(1)
  const [paginasTotales, setPaginasTotales] = useState(1)
  const [totalRegistros, setTotalRegistros] = useState(0)

  // Solo el texto espera un instante; los selects, fechas y el orden recargan al instante.
  const filtrosPrevios = useRef({
    search: vistaGuardada?.filtros?.buscar ?? '',
    filterEstado: vistaGuardada?.filtros?.estado ?? 'todos',
    filterMateria: vistaGuardada?.filtros?.materiaId ? String(vistaGuardada.filtros.materiaId) : 'todos',
    filterDocente: vistaGuardada?.filtros?.docenteId ? String(vistaGuardada.filtros.docenteId) : 'todos',
    desde: fechaIsoAInput(vistaGuardada?.filtros?.vigenciaDesde),
    hasta: fechaIsoAInput(vistaGuardada?.filtros?.vigenciaHasta),
    orden: normalizarOrden(vistaGuardada?.orden),
  })
  const requestSeq = useRef(0)

  const rangoInvalido = Boolean(desde && hasta && desde > hasta)

  useEffect(() => {
    const ac = new AbortController()
    getOpcionesAsignacionAula({ signal: ac.signal })
      .then((res) => {
        setOpciones({
          materias: res?.materias || [],
          docentes: res?.docentes || [],
        })
      })
      .catch((error) => {
        if (error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') return
        toastError({
          title: 'Error',
          text: mensajeErrorAsignacion(error, 'No se pudieron cargar materias y docentes para los filtros.'),
        })
      })
    return () => ac.abort()
  }, [])

  useEffect(() => {
    const ac = new AbortController()
    getVistasAsignaciones({ signal: ac.signal })
      .then((res) => {
        const lista = Array.isArray(res) ? res : []
        setVistas(lista)
        setVistaActiva((actual) => {
          if (!actual) return ''
          const existe = lista.some((v) => String(v.id) === String(actual))
          if (!existe) localStorage.removeItem(CLAVE_VISTA)
          return existe ? String(actual) : ''
        })
      })
      .catch((error) => {
        if (error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') return
        // Las vistas son una ayuda: si fallan, el listado sigue funcionando.
      })
    return () => ac.abort()
  }, [])

  useEffect(() => {
    const prev = filtrosPrevios.current
    const soloCambioTexto =
      prev.search !== search &&
      prev.filterEstado === filterEstado &&
      prev.filterMateria === filterMateria &&
      prev.filterDocente === filterDocente &&
      prev.desde === desde &&
      prev.hasta === hasta &&
      prev.orden.campo === orden.campo &&
      prev.orden.direccion === orden.direccion

    filtrosPrevios.current = {
      search,
      filterEstado,
      filterMateria,
      filterDocente,
      desde,
      hasta,
      orden,
    }

    const t = setTimeout(() => {
      fetchData({ pagina: 1 })
    }, soloCambioTexto ? 350 : 0)

    return () => clearTimeout(t)
  }, [search, filterEstado, filterMateria, filterDocente, desde, hasta, orden.campo, orden.direccion])

  const fetchData = async (options = {}) => {
    const seq = ++requestSeq.current
    const buscar = options.buscar !== undefined ? options.buscar : search
    const estado = options.estado !== undefined ? options.estado : filterEstado
    const materiaId = options.materiaId !== undefined ? options.materiaId : filterMateria
    const docenteId = options.docenteId !== undefined ? options.docenteId : filterDocente
    const pagina = options.pagina !== undefined ? options.pagina : paginaActual
    const vigenciaDesde = options.vigenciaDesde !== undefined ? options.vigenciaDesde : inputAFechaIso(desde)
    const vigenciaHasta = options.vigenciaHasta !== undefined
      ? options.vigenciaHasta
      : inputAFechaIso(hasta, { finDelDia: true })

    if (rangoInvalido) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const res = await getAsignacionesAula({
        buscar,
        estado,
        materiaId,
        docenteId,
        vigenciaDesde,
        vigenciaHasta,
        ordenarPor: orden.campo,
        direccion: orden.direccion,
        pagina,
        limite: LIMITE_POR_PAGINA,
      })
      if (seq !== requestSeq.current) return
      setAsignaciones(res.datos || [])
      setPaginaActual(res.paginaActual || 1)
      setPaginasTotales(res.paginasTotales || 1)
      setTotalRegistros(res.totalRegistros || 0)
    } catch (error) {
      if (seq !== requestSeq.current) return
      setAsignaciones([])
      toastError({
        title: 'Error',
        text: mensajeErrorAsignacion(error, 'No se pudieron cargar las asignaciones.'),
      })
    } finally {
      if (seq === requestSeq.current) setLoading(false)
    }
  }

  const hayFiltros =
    search.trim() !== '' ||
    filterEstado !== 'todos' ||
    filterMateria !== 'todos' ||
    filterDocente !== 'todos' ||
    desde !== '' ||
    hasta !== ''

  const limpiarFiltros = () => {
    setSearch('')
    setFilterEstado('todos')
    setFilterMateria('todos')
    setFilterDocente('todos')
    setDesde('')
    setHasta('')
  }

  const cambiarOrden = (campo) => {
    setOrden((prev) => (
      prev.campo === campo
        ? { campo, direccion: prev.direccion === 'asc' ? 'desc' : 'asc' }
        : { campo, direccion: 'asc' }
    ))
  }

  const indicadorOrden = (campo) => {
    if (orden.campo !== campo) return '↕'
    return orden.direccion === 'asc' ? '▲' : '▼'
  }

  const filtrosActuales = () => ({
    estado: filterEstado === 'todos' ? null : filterEstado,
    buscar: search.trim() || null,
    materiaId: filterMateria === 'todos' ? null : Number(filterMateria),
    docenteId: filterDocente === 'todos' ? null : Number(filterDocente),
    vigenciaDesde: inputAFechaIso(desde) ?? null,
    vigenciaHasta: inputAFechaIso(hasta, { finDelDia: true }) ?? null,
  })

  const aplicarVista = (id) => {
    setVistaActiva(id)
    const vista = vistas.find((v) => String(v.id) === String(id))

    if (!vista) {
      localStorage.removeItem(CLAVE_VISTA)
      return
    }

    const filtros = vista.filtros || {}
    setSearch(filtros.buscar || '')
    setFilterEstado(filtros.estado || 'todos')
    setFilterMateria(filtros.materiaId ? String(filtros.materiaId) : 'todos')
    setFilterDocente(filtros.docenteId ? String(filtros.docenteId) : 'todos')
    setDesde(fechaIsoAInput(filtros.vigenciaDesde))
    setHasta(fechaIsoAInput(filtros.vigenciaHasta))
    setOrden(normalizarOrden(vista.orden))
    localStorage.setItem(CLAVE_VISTA, JSON.stringify(vista))
  }

  const handleGuardarVista = async () => {
    const vistaActual = vistas.find((v) => String(v.id) === String(vistaActiva))
    const nombre = await inputDialog({
      title: 'Guardar vista',
      text: 'Se guardan los filtros y el orden actuales con el nombre que elijas.',
      inputLabel: 'Nombre de la vista',
      inputPlaceholder: 'Mi vista diaria',
      inputValue: vistaActual?.nombre ?? '',
      confirmText: 'Guardar',
    })

    if (!nombre) return

    try {
      const vista = await guardarVistaAsignaciones({
        nombre,
        filtros: filtrosActuales(),
        orden,
      })

      setVistas((prev) => {
        const otras = prev.filter((v) => v.id !== vista.id)
        return [...otras, vista].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
      })
      setVistaActiva(String(vista.id))
      localStorage.setItem(CLAVE_VISTA, JSON.stringify(vista))
      toastSuccess({ text: `Vista "${vista.nombre}" guardada.` })
    } catch (error) {
      toastError({
        title: 'No se pudo guardar la vista',
        text: mensajeErrorAsignacion(error, 'Intentá nuevamente en unos instantes.'),
      })
    }
  }

  const handleEliminarVista = async () => {
    const vista = vistas.find((v) => String(v.id) === String(vistaActiva))
    if (!vista) return

    const confirmado = await confirmDialog({
      title: 'Eliminar vista',
      text: `Se eliminará "${vista.nombre}". Los filtros actuales se mantienen en pantalla.`,
      confirmText: 'Eliminar',
      danger: true,
    })
    if (!confirmado) return

    try {
      await eliminarVistaAsignaciones(vista.id)
      setVistas((prev) => prev.filter((v) => v.id !== vista.id))
      setVistaActiva('')
      localStorage.removeItem(CLAVE_VISTA)
      toastSuccess({ text: 'Vista eliminada.' })
    } catch (error) {
      toastError({
        title: 'No se pudo eliminar la vista',
        text: mensajeErrorAsignacion(error, 'Intentá nuevamente en unos instantes.'),
      })
    }
  }

  const handleExportar = async (formato) => {
    if (rangoInvalido) return
    setExportando(formato)
    try {
      const { blob, filename } = await exportarAsignacionesAula({
        formato,
        estado: filterEstado,
        buscar: search,
        materiaId: filterMateria === 'todos' ? undefined : filterMateria,
        docenteId: filterDocente === 'todos' ? undefined : filterDocente,
        vigenciaDesde: inputAFechaIso(desde),
        vigenciaHasta: inputAFechaIso(hasta, { finDelDia: true }),
        ordenarPor: orden.campo,
        direccion: orden.direccion,
      })
      descargarArchivo(blob, filename)
      toastSuccess({ text: `Listado exportado en ${formato.toUpperCase()}.` })
    } catch (error) {
      toastError({
        title: 'No se pudo exportar',
        text: mensajeErrorAsignacion(error, 'Intentá nuevamente en unos instantes.'),
      })
    } finally {
      setExportando('')
    }
  }

  const abrirDetalle = async (row) => {
    try {
      const full = await getAsignacionAulaById(row.id)
      setDetalle(full)
    } catch (error) {
      toastError({
        title: 'No se pudo abrir el detalle',
        text: mensajeErrorAsignacion(error, 'La asignación no existe o no está disponible.'),
      })
    }
  }

  const handleRowClick = (e, row) => {
    if (e.target.closest('.btn-icon') || e.target.closest('.actions-col')) return
    abrirDetalle(row)
  }

  const handleCerrar = async (row) => {
    if (!esAbierta(row.estado)) {
      toastError({ title: 'No disponible', text: 'La asignación ya se encuentra cerrada.' })
      return
    }

    const confirmado = await confirmDialog({
      title: 'Cerrar asignación',
      text: `Se registrará la fecha de cierre de "${row.aulaNombre} · ${row.materiaNombre}". Esta acción no se puede revertir ni reabrir el mismo registro.`,
      confirmText: 'Sí, cerrar',
      cancelText: 'Cancelar',
      danger: true,
    })
    if (!confirmado) return

    setCerrandoId(row.id)
    try {
      const cerrada = await cerrarAsignacionAula(row.id)
      toastSuccess({ text: 'Asignación cerrada. La fecha de cierre quedó registrada.' })
      setDetalle((prev) => (prev && prev.id === row.id ? cerrada : prev))
      fetchData({ pagina: paginaActual })
    } catch (error) {
      toastError({
        title: 'No se pudo cerrar',
        text: mensajeErrorAsignacion(error, 'No se pudo cerrar la asignación.'),
      })
    } finally {
      setCerrandoId(null)
    }
  }

  if (showForm) {
    return (
      <AsignacionForm
        onClose={(huboCambios) => {
          setShowForm(false)
          if (huboCambios === true) fetchData({ pagina: 1 })
        }}
      />
    )
  }

  return (
    <div className="personasWrap asignacionesWrap">
      <div className="personasPanel">
        <div className="panelHeader asigHeader">
          <div>
            <div className="panelTitle">Asignaciones de aula</div>
            <div className="panelSub">
              Grupos de aula con materia, docente, cupo y vigencia
            </div>
          </div>
          <div className="asigHeaderActions">
            <select
              className="select-field asigVistaSelect"
              value={vistaActiva}
              onChange={(e) => aplicarVista(e.target.value)}
              aria-label="Mis vistas guardadas"
            >
              <option value="">Mis vistas…</option>
              {vistas.map((vista) => (
                <option key={vista.id} value={String(vista.id)}>{vista.nombre}</option>
              ))}
            </select>
            <button type="button" className="btn outline" onClick={handleGuardarVista}>
              Guardar vista
            </button>
            {vistaActiva ? (
              <button
                type="button"
                className="btn-icon danger"
                title="Eliminar vista seleccionada"
                onClick={handleEliminarVista}
              >
                🗑
              </button>
            ) : null}
            <button
              type="button"
              className="btn outline"
              onClick={() => handleExportar('csv')}
              disabled={exportando !== ''}
            >
              {exportando === 'csv' ? 'Exportando…' : 'Exportar CSV'}
            </button>
            <button
              type="button"
              className="btn outline"
              onClick={() => handleExportar('xlsx')}
              disabled={exportando !== ''}
            >
              {exportando === 'xlsx' ? 'Exportando…' : 'Exportar XLSX'}
            </button>
            <button type="button" className="btn primary" onClick={() => setShowForm(true)}>
              + Nueva asignación
            </button>
          </div>
        </div>

        <div className="filtersRow asigFilters">
          <input
            className="search input-field"
            placeholder="Buscar por aula, materia o docente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar asignaciones por texto"
          />
          <select
            className="select-field"
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            aria-label="Filtrar por estado"
          >
            <option value="todos">Todos los estados</option>
            <option value="Abierta">Abiertas</option>
            <option value="Cerrada">Cerradas</option>
          </select>
          <select
            className="select-field"
            value={filterMateria}
            onChange={(e) => setFilterMateria(e.target.value)}
            aria-label="Filtrar por materia"
          >
            <option value="todos">Todas las materias</option>
            {opciones.materias.map((m) => (
              <option key={m.id} value={String(m.id)}>{m.nombre}</option>
            ))}
          </select>
          <select
            className="select-field"
            value={filterDocente}
            onChange={(e) => setFilterDocente(e.target.value)}
            aria-label="Filtrar por docente"
          >
            <option value="todos">Todos los docentes</option>
            {opciones.docentes.map((d) => (
              <option key={d.id} value={String(d.id)}>{d.nombreCompleto}</option>
            ))}
          </select>
          <button
            type="button"
            className="btn outline asigClearBtn"
            onClick={limpiarFiltros}
            disabled={!hayFiltros}
          >
            Limpiar filtros
          </button>
        </div>

        <div className="asigDateRange">
          <span className="asigRangeLabel">Vigencia</span>
          <label className="asigDateField">
            <span>Desde</span>
            <input
              type="date"
              className="input-field"
              value={desde}
              max={hasta || undefined}
              onChange={(e) => setDesde(e.target.value)}
              aria-label="Vigencia desde"
            />
          </label>
          <label className="asigDateField">
            <span>Hasta</span>
            <input
              type="date"
              className="input-field"
              value={hasta}
              min={desde || undefined}
              onChange={(e) => setHasta(e.target.value)}
              aria-label="Vigencia hasta"
            />
          </label>
          {(desde || hasta) ? (
            <button
              type="button"
              className="btn outline small"
              onClick={() => { setDesde(''); setHasta('') }}
            >
              Limpiar rango
            </button>
          ) : null}
          {rangoInvalido ? (
            <span className="asigRangeError" role="alert">
              La fecha desde no puede ser posterior a la hasta.
            </span>
          ) : null}
        </div>

        <div className="asigResultCount" aria-live="polite">
          {loading
            ? 'Actualizando resultados…'
            : `${totalRegistros} resultado${totalRegistros === 1 ? '' : 's'}`}
        </div>

        <div className="tableContainer">
          {loading ? (
            <div className="emptyState">Cargando asignaciones...</div>
          ) : (
            <table className="personasTable">
              <thead>
                <tr>
                  <th>
                    <button type="button" className={`thSort${orden.campo === 'id' ? ' active' : ''}`} onClick={() => cambiarOrden('id')}>
                      ID <span className="sortIndicator" aria-hidden="true">{indicadorOrden('id')}</span>
                    </button>
                  </th>
                  <th>
                    <button type="button" className={`thSort${orden.campo === 'aula' ? ' active' : ''}`} onClick={() => cambiarOrden('aula')}>
                      Asignación <span className="sortIndicator" aria-hidden="true">{indicadorOrden('aula')}</span>
                    </button>
                  </th>
                  <th>
                    <button type="button" className={`thSort${orden.campo === 'estado' ? ' active' : ''}`} onClick={() => cambiarOrden('estado')}>
                      Estado <span className="sortIndicator" aria-hidden="true">{indicadorOrden('estado')}</span>
                    </button>
                  </th>
                  <th>
                    <button type="button" className={`thSort${orden.campo === 'docente' ? ' active' : ''}`} onClick={() => cambiarOrden('docente')}>
                      Docente <span className="sortIndicator" aria-hidden="true">{indicadorOrden('docente')}</span>
                    </button>
                  </th>
                  <th>
                    <button type="button" className={`thSort${orden.campo === 'cupo' ? ' active' : ''}`} onClick={() => cambiarOrden('cupo')}>
                      Cupo <span className="sortIndicator" aria-hidden="true">{indicadorOrden('cupo')}</span>
                    </button>
                  </th>
                  <th>
                    <button type="button" className={`thSort${orden.campo === 'vigencia' ? ' active' : ''}`} onClick={() => cambiarOrden('vigencia')}>
                      Vigencia <span className="sortIndicator" aria-hidden="true">{indicadorOrden('vigencia')}</span>
                    </button>
                  </th>
                  <th className="actions-col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {asignaciones.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="emptyState">
                      No se encontraron asignaciones con los filtros actuales.
                    </td>
                  </tr>
                ) : (
                  asignaciones.map((row) => {
                    const abierta = esAbierta(row.estado)
                    const ocupados = Number(row.cuposOcupados ?? 0)
                    const habilitado = Number(row.cupoHabilitado ?? 0)
                    const porcentaje = habilitado > 0
                      ? Math.min(100, Math.round((ocupados / habilitado) * 100))
                      : 0
                    return (
                      <tr
                        key={row.id}
                        className={abierta ? '' : 'row-inactive'}
                        onClick={(e) => handleRowClick(e, row)}
                      >
                        <td className="asigId">#{row.id}</td>
                        <td>
                          <div className="fw-600">{row.aulaNombre}</div>
                          <div className="asigSub">{row.materiaNombre}</div>
                        </td>
                        <td>
                          <span className={`badge ${claseBadgeEstado(row.estado)}`}>{row.estado}</span>
                        </td>
                        <td>
                          <div>{row.docenteNombre}</div>
                          {row.docenteDni ? <div className="asigSub">DNI {row.docenteDni}</div> : null}
                        </td>
                        <td>
                          <div className="cupoCell">
                            <span className="cupoText">{textoCupo(row)}</span>
                            <span className="cupoBar" aria-hidden="true">
                              <span style={{ width: `${porcentaje}%` }} />
                            </span>
                          </div>
                        </td>
                        <td className="asigVigencia">{formatFechaHora(row.finVigencia)}</td>
                        <td className="actions-col">
                          <button
                            type="button"
                            className="btn-icon"
                            title="Ver detalle"
                            onClick={() => abrirDetalle(row)}
                          >
                            👁
                          </button>
                          <button
                            type="button"
                            className={`btn-icon ${abierta ? 'danger' : ''}`}
                            title={abierta ? 'Cerrar asignación' : 'Asignación cerrada'}
                            disabled={!abierta || cerrandoId === row.id}
                            onClick={() => handleCerrar(row)}
                          >
                            🔒
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
            Mostrando {asignaciones.length} de {totalRegistros} registros (Pág. {paginaActual} de {paginasTotales})
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

      {detalle && (
        <AsignacionDetailModal
          asignacion={detalle}
          onClose={() => setDetalle(null)}
          onCerrarAsignacion={handleCerrar}
        />
      )}
    </div>
  )
}
