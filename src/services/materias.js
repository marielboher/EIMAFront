import { http } from '../lib/http'

/**
 * Catálogo público de materias agrupadas por área (para contacto).
 */
export async function fetchMateriasCatalogoPorArea({ signal } = {}) {
  const res = await http.get('/api/Materias/catalogo-por-area', { signal })
  return Array.isArray(res.data) ? res.data : []
}

/**
 * Lista de materias. Sin pagina/limite → array plano.
 * Con pagina/limite → { datos, paginaActual, ... }.
 */
export async function getMaterias({ signal, buscar, area, estado, pagina, limite } = {}) {
  const params = {}
  if (buscar != null && buscar !== '') params.buscar = buscar
  if (area != null && area !== '' && area !== 'todas') params.area = area
  if (estado != null && estado !== '' && estado !== 'todos') params.estado = estado
  if (pagina != null) params.pagina = pagina
  if (limite != null) params.limite = limite
  const res = await http.get('/api/Materias', { signal, params })
  return res.data
}

export async function getMateriaById(id, { signal } = {}) {
  const res = await http.get(`/api/Materias/${id}`, { signal })
  return res.data
}

export async function createMateria(payload, { signal } = {}) {
  const res = await http.post('/api/Materias', payload, { signal })
  return res.data
}

export async function updateMateria(id, payload, { signal } = {}) {
  const res = await http.put(`/api/Materias/${id}`, payload, { signal })
  return res.data
}

export async function toggleMateriaEstado(id, { signal } = {}) {
  const res = await http.patch(`/api/Materias/${id}/cambiar-estado`, null, { signal })
  return res.data
}

export function mensajeErrorMateria(error, fallback = 'Ocurrió un error inesperado.') {
  return error?.response?.data?.mensaje
    || error?.response?.data?.errores?.[0]?.mensaje
    || error?.response?.data?.title
    || error?.message
    || fallback
}
