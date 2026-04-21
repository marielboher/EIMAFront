import { http } from '../lib/http'

export async function getPersonas({ signal, rolId } = {}) {
  const params = {}
  if (rolId != null && rolId !== '') params.rolId = rolId
  const res = await http.get('/api/Personas', { signal, params })
  return res.data
}

export async function getPersonaById(id, { signal } = {}) {
  const res = await http.get(`/api/Personas/${id}`, { signal })
  return res.data
}

/** Perfil de la cuenta autenticada (nombre, apellido, DNI, correo, etc.). */
export async function fetchMiPerfil({ signal } = {}) {
  const res = await http.get('/api/Personas/mi-perfil', { signal })
  return res.data
}

