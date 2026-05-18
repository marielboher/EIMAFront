import { http } from '../lib/http'

export async function getPersonas({ signal, rol, estado, buscar, pagina, limite } = {}) {
  const params = {}
  if (rol != null && rol !== '') params.rol = rol
  if (estado != null && estado !== '') params.estado = estado
  if (buscar != null && buscar !== '') params.buscar = buscar
  if (pagina != null) params.pagina = pagina
  if (limite != null) params.limite = limite
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
export async function togglePersonaEstado(id, { signal } = {}) {
  const res = await http.patch(`/api/Personas/${id}/cambiar-estado`, null, { signal })
  return res.data
}

export async function createPersona(personaData, { signal } = {}) {
  const res = await http.post('/api/Personas', personaData, { signal })
  return res.data
}

export async function updatePersona(id, personaData, { signal } = {}) {
  const res = await http.put(`/api/Personas/${id}`, personaData, { signal })
  return res.data
}
