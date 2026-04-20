import { http } from '../lib/http'

/**
 * Catálogo público de materias agrupadas por área (para contacto).
 * @returns {Promise<Array<{ area: string, materias: Array<{ id: number, nombre: string }> }>>}
 */
export async function fetchMateriasCatalogoPorArea({ signal } = {}) {
  const res = await http.get('/api/Materias/catalogo-por-area', { signal })
  return Array.isArray(res.data) ? res.data : []
}
