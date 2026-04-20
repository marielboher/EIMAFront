import { http } from '../lib/http'

/**
 * Envía una consulta desde el formulario público de contacto.
 * @param {{ nombre: string, apellido: string, email: string, telefono: string, materiaId: number, asunto: string, mensaje: string }} payload
 */
export async function enviarConsultaPublica(payload, { signal } = {}) {
  try {
    const res = await http.post('/api/Consultas/publico', payload, { signal })
    return { ok: true, data: res.data }
  } catch (err) {
    const status = err?.response?.status
    const data = err?.response?.data
    const erroresCampos = data?.errors ?? data?.Errors ?? null
    return {
      ok: false,
      status,
      data,
      erroresCampos,
      message:
        data?.title ??
        data?.Title ??
        data?.mensaje ??
        data?.Mensaje ??
        err?.message ??
        'No se pudo enviar la consulta. Intentá de nuevo más tarde.',
    }
  }
}
