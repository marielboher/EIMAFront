import { http } from '../lib/http'

/**
 * Catálogo público de materias agrupadas por área (para contacto).
 * @returns {Promise<Array<{ area: string, materias: Array<{ id: number, nombre: string }> }>>}
 */
export async function fetchMateriasCatalogoPorArea({ signal } = {}) {
  const res = await http.get('/api/Materias/catalogo-por-area', { signal })
  return Array.isArray(res.data) ? res.data : []
}

/**
 * Lista de materias (ABM admin / asignar a profesores).
 * @returns {Promise<Array<{ id: number, nombre: string, area: string|null, descripcion: string|null, duracionHoras: number, precioPorClase: number, activa: boolean }>>}
 */
export async function getMaterias({ signal, soloActivas } = {}) {
  const res = await http.get('/api/Materias', {
    signal,
    params: soloActivas === true ? { soloActivas: true } : undefined,
  })
  return Array.isArray(res.data) ? res.data : []
}

/**
 * @param {{ nombre: string, area?: string|null, descripcion?: string|null, duracionHoras?: number, precioPorClase?: number, activa?: boolean }} payload
 */
export async function createMateria(payload) {
  const res = await http.post('/api/Materias', {
    nombre: payload.nombre,
    area: payload.area ?? null,
    descripcion: payload.descripcion ?? null,
    duracionHoras: payload.duracionHoras ?? 0,
    precioPorClase: payload.precioPorClase ?? 0,
    activa: payload.activa ?? true,
  })
  return res.data
}

/**
 * @param {number} id
 * @param {{ nombre: string, area?: string|null, descripcion?: string|null, duracionHoras?: number, precioPorClase?: number, activa?: boolean }} payload
 */
export async function updateMateria(id, payload) {
  const res = await http.put(`/api/Materias/${id}`, {
    nombre: payload.nombre,
    area: payload.area ?? null,
    descripcion: payload.descripcion ?? null,
    duracionHoras: payload.duracionHoras ?? 0,
    precioPorClase: payload.precioPorClase ?? 0,
    activa: payload.activa ?? true,
  })
  return res.data
}

/** Baja/alta lógica (toggle Activa). */
export async function toggleMateriaEstado(id) {
  const res = await http.patch(`/api/Materias/${id}/cambiar-estado`)
  return res.data
}
