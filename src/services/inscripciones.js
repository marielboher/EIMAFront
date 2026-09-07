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

export async function darDeBajaInscripcion(id, { signal } = {}) {
  const res = await http.patch(`/api/InscripcionesMateria/${id}/baja`, null, { signal })
  return res.data
}

/**
 * HU20 — registra pago (multipart). estado por defecto Pendiente en backend si se omite.
 * @param {object} datos
 * @param {number} datos.monto
 * @param {string} datos.metodoPago
 * @param {string} datos.fechaPago — yyyy-MM-dd
 * @param {string} [datos.estado]
 * @param {string} [datos.observaciones]
 * @param {File} [datos.comprobante]
 */
export async function registrarPagoInscripcion(id, datos, { signal } = {}) {
  const fd = new FormData()
  fd.append('monto', String(datos.monto))
  fd.append('metodoPago', datos.metodoPago)
  fd.append('fechaPago', datos.fechaPago)
  if (datos.estado) fd.append('estado', datos.estado)
  if (datos.observaciones) fd.append('observaciones', datos.observaciones)
  if (datos.comprobante instanceof File) fd.append('comprobante', datos.comprobante)

  const res = await http.post(`/api/InscripcionesMateria/${id}/pagos`, fd, {
    signal,
    transformRequest: [(data, headers) => {
      if (data instanceof FormData) {
        delete headers['Content-Type']
      }
      return data
    }],
  })
  return res.data
}

export function mensajeErrorApi(error, fallback = 'Ocurrió un error inesperado.') {
  return error?.response?.data?.mensaje
    || error?.response?.data?.errores?.[0]?.mensaje
    || error?.response?.data?.title
    || error?.message
    || fallback
}
