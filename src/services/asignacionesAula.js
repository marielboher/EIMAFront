import { http } from '../lib/http'

/** Construye los parámetros de filtro/orden compartidos por el listado y la exportación. */
function paramsDeListado({
  estado,
  buscar,
  aulaId,
  materiaId,
  docenteId,
  ordenarPor,
  direccion,
  vigenciaDesde,
  vigenciaHasta,
} = {}) {
  const params = {}
  if (estado != null && estado !== '' && estado !== 'todos') params.estado = estado
  if (buscar != null && buscar !== '') params.buscar = buscar
  if (aulaId != null && aulaId !== '' && aulaId !== 'todos') params.aulaId = aulaId
  if (materiaId != null && materiaId !== '' && materiaId !== 'todos') params.materiaId = materiaId
  if (docenteId != null && docenteId !== '' && docenteId !== 'todos') params.docenteId = docenteId
  if (ordenarPor) params.ordenarPor = ordenarPor
  if (direccion) params.direccion = direccion
  if (vigenciaDesde) params.vigenciaDesde = vigenciaDesde
  if (vigenciaHasta) params.vigenciaHasta = vigenciaHasta
  return params
}

/**
 * Listado paginado de grupos de aula (HU23) con filtros (HU24/HU26) y orden (HU25).
 * Por defecto el backend usa 25 por página.
 */
export async function getAsignacionesAula({ signal, pagina, limite, ...filtros } = {}) {
  const params = paramsDeListado(filtros)
  if (pagina != null) params.pagina = pagina
  if (limite != null) params.limite = limite
  const res = await http.get('/api/AsignacionesAula', { signal, params })
  return res.data
}

export async function getAsignacionAulaById(id, { signal } = {}) {
  const res = await http.get(`/api/AsignacionesAula/${id}`, { signal })
  return res.data
}

/** Aulas activas, materias activas y docentes activos para el formulario de alta. */
export async function getOpcionesAsignacionAula({ signal } = {}) {
  const res = await http.get('/api/AsignacionesAula/opciones', { signal })
  return res.data
}

export async function createAsignacionAula(payload, { signal } = {}) {
  const res = await http.post('/api/AsignacionesAula', payload, { signal })
  return res.data
}

/** Cierre definitivo: registra fechaCierre una sola vez. */
export async function cerrarAsignacionAula(id, { signal } = {}) {
  const res = await http.patch(`/api/AsignacionesAula/${id}/cerrar`, null, { signal })
  return res.data
}

/** Vistas guardadas del usuario autenticado (HU25). */
export async function getVistasAsignaciones({ signal } = {}) {
  const res = await http.get('/api/AsignacionesAula/vistas', { signal })
  return res.data
}

export async function guardarVistaAsignaciones({ nombre, filtros, orden }, { signal } = {}) {
  const res = await http.post('/api/AsignacionesAula/vistas', { nombre, filtros, orden }, { signal })
  return res.data
}

export async function eliminarVistaAsignaciones(id, { signal } = {}) {
  await http.delete(`/api/AsignacionesAula/vistas/${id}`, { signal })
}

/**
 * Exporta el recorte visible (HU27) y devuelve el blob junto con el nombre sugerido.
 */
export async function exportarAsignacionesAula({ formato = 'csv', ...filtros } = {}) {
  const params = paramsDeListado(filtros)
  params.formato = formato
  const res = await http.get('/api/AsignacionesAula/exportar', {
    params,
    responseType: 'blob',
  })

  const disposicion = res.headers?.['content-disposition'] || ''
  const coincidencia = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposicion)
  const nombre = coincidencia?.[1]
    ? decodeURIComponent(coincidencia[1])
    : `asignaciones-aula.${formato}`

  return { blob: res.data, filename: nombre }
}

/** Indicadores del mes (HU28). */
export async function getInformeAsignacionesAula({ anio, mes, signal } = {}) {
  const res = await http.get('/api/Informes/AsignacionesAula', {
    signal,
    params: { anio, mes },
  })
  return res.data
}

export function mensajeErrorAsignacion(error, fallback = 'Ocurrió un error inesperado.') {
  return error?.response?.data?.mensaje
    || error?.response?.data?.errores?.[0]?.mensaje
    || error?.response?.data?.title
    || error?.message
    || fallback
}
