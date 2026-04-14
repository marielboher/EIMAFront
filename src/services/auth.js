import { http } from '../lib/http'

function normalizeFieldError(e) {
  const campo = e?.campo ?? e?.Campo ?? e?.field ?? e?.Field ?? 'Sistema'
  const mensaje = e?.mensaje ?? e?.Mensaje ?? e?.message ?? 'Ocurrió un error.'
  return { campo, mensaje }
}

export async function fetchPasswordStrength(contrasena, { signal } = {}) {
  const res = await http.post(
    '/api/Auth/fortaleza-contrasena',
    { contrasena },
    { signal },
  )
  return res.data
}

export async function registerUser(payload, { signal } = {}) {
  try {
    const res = await http.post('/api/Auth/registro', payload, { signal })
    return { ok: true, data: res.data }
  } catch (err) {
    const status = err?.response?.status
    const data = err?.response?.data
    const erroresRaw = data?.errores ?? data?.Errores ?? null
    const errores = Array.isArray(erroresRaw) ? erroresRaw.map(normalizeFieldError) : null

    return {
      ok: false,
      status,
      data,
      errores,
      message:
        data?.mensaje ??
        data?.Mensaje ??
        err?.message ??
        'No se pudo completar el registro.',
    }
  }
}

