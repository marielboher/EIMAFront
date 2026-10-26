import { http } from '../lib/http'

/**
 * Catálogo de aulas (HU22).
 * Sin pagina/limite → array plano. Con pagina/limite → { datos, paginaActual, ... }.
 */
export async function getAulas({ signal, buscar, estado, pagina, limite } = {}) {
  const params = {}
  if (buscar != null && buscar !== '') params.buscar = buscar
  if (estado != null && estado !== '' && estado !== 'todas' && estado !== 'todos') params.estado = estado
  if (pagina != null) params.pagina = pagina
  if (limite != null) params.limite = limite
  const res = await http.get('/api/Aulas', { signal, params })
  return res.data
}

export async function getAulaById(id, { signal } = {}) {
  const res = await http.get(`/api/Aulas/${id}`, { signal })
  return res.data
}

export async function createAula(payload, { signal } = {}) {
  const res = await http.post('/api/Aulas', payload, { signal })
  return res.data
}

export async function updateAula(id, payload, { signal } = {}) {
  const res = await http.put(`/api/Aulas/${id}`, payload, { signal })
  return res.data
}

export async function toggleAulaEstado(id, { signal } = {}) {
  const res = await http.patch(`/api/Aulas/${id}/cambiar-estado`, null, { signal })
  return res.data
}

export function mensajeErrorAula(error, fallback = 'Ocurrió un error inesperado.') {
  return error?.response?.data?.mensaje
    || error?.response?.data?.errores?.[0]?.mensaje
    || error?.response?.data?.title
    || error?.message
    || fallback
}
