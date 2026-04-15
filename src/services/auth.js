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
    {
      signal,
      // Evita que el UI quede colgado en “Calculando…”
      timeout: 1500,
    },
  )
  return res.data
}

export async function loginUser(payload, { signal } = {}) {
  try {
    const res = await http.post('/api/Auth/login', payload, { signal })
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
        'No se pudo iniciar sesión.',
    }
  }
}

export async function requestPasswordRecovery(payload, { signal } = {}) {
  try {
    const res = await http.post('/api/Auth/recuperar-contrasena', payload, { signal })
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
      message: data?.mensaje ?? data?.Mensaje ?? err?.message ?? 'No se pudo solicitar la recuperación.',
    }
  }
}

export async function resetPassword(payload, { signal } = {}) {
  try {
    const res = await http.post('/api/Auth/restablecer-contrasena', payload, { signal })
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
      message: data?.mensaje ?? data?.Mensaje ?? err?.message ?? 'No se pudo restablecer la contraseña.',
    }
  }
}

export async function logoutUser({ signal } = {}) {
  try {
    const res = await http.post('/api/Auth/logout', null, { signal })
    return { ok: true, data: res.data }
  } catch (err) {
    return {
      ok: false,
      status: err?.response?.status,
      data: err?.response?.data,
      message: err?.message ?? 'No se pudo cerrar sesión.',
    }
  }
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

