import { http } from '../lib/http'

export async function getInscripciones({ signal, estado, buscar, materiaId, pagina, limite } = {}) {
  const params = {}
  if (estado != null && estado !== '') params.estado = estado
  if (buscar != null && buscar !== '') params.buscar = buscar
  if (materiaId != null && materiaId !== '' && materiaId !== 'todos') params.materiaId = materiaId
  if (pagina != null) params.pagina = pagina
  if (limite != null) params.limite = limite
  const res = await http.get('/api/InscripcionesMateria', { signal, params })
  return res.data
}

export async function getInscripcionById(id, { signal } = {}) {
  const res = await http.get(`/api/InscripcionesMateria/${id}`, { signal })
  return res.data
}

export async function createInscripcion(payload, { signal } = {}) {
  const res = await http.post('/api/InscripcionesMateria', payload, { signal })
  return res.data
}

export async function updateInscripcion(id, payload, { signal } = {}) {
  const res = await http.put(`/api/InscripcionesMateria/${id}`, payload, { signal })
  return res.data
}

/** HU20 — registra pago asociado a InscripcionMateriaId + PersonaId */
export async function registrarPagoInscripcion(id, payload, { signal } = {}) {
  // payload: { monto, metodoPago, fechaPago, estado?, comprobante?, observaciones? }
  const res = await http.post(`/api/InscripcionesMateria/${id}/pagos`, payload, { signal })
  return res.data
}
