/** Alineado con `ValidadorAutenticacion` del backend (.NET). */
const CORREO_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

export function esCorreoValido(correo) {
  if (!correo || typeof correo !== 'string') return false
  return CORREO_REGEX.test(correo.trim())
}

/** Lista de requisitos no cumplidos (mismos textos que el servidor en lo posible). */
export function requisitosContrasenaIncumplidos(contrasena) {
  const mensajes = []
  if (!contrasena) return mensajes
  if (contrasena.length < 8) mensajes.push('La contraseña debe tener al menos 8 caracteres.')
  if (!/[A-ZÁÉÍÓÚÑ]/.test(contrasena))
    mensajes.push('La contraseña debe incluir al menos una letra mayúscula.')
  if (!/[0-9]/.test(contrasena)) mensajes.push('La contraseña debe incluir al menos un número.')
  if (!/[\W_]/.test(contrasena))
    mensajes.push('La contraseña debe incluir al menos un carácter especial (por ejemplo: !@#$%&*).')
  return mensajes
}

/**
 * Estimación local (fallback) de fortaleza.
 * Devuelve el mismo shape que la API: { nivel, descripcion }.
 */
export function calcularFortalezaLocal(contrasena) {
  if (!contrasena || !contrasena.trim()) return { nivel: 'muyDebil', descripcion: 'Muy débil' }

  const pw = contrasena
  const len = pw.length
  const tieneMayus = /[A-ZÁÉÍÓÚÑ]/.test(pw)
  const tieneMinus = /[a-záéíóúñ]/.test(pw)
  const tieneDig = /[0-9]/.test(pw)
  const tieneEsp = /[\W_]/.test(pw)
  const variedad = (tieneMayus ? 1 : 0) + (tieneMinus ? 1 : 0) + (tieneDig ? 1 : 0) + (tieneEsp ? 1 : 0)

  if (len < 6 || variedad <= 1) return { nivel: 'muyDebil', descripcion: 'Muy débil' }

  const cumple = requisitosContrasenaIncumplidos(pw).length === 0
  if (!cumple) return { nivel: 'debil', descripcion: 'Débil' }

  if (len >= 12 && variedad >= 4) return { nivel: 'fuerte', descripcion: 'Fuerte' }
  return { nivel: 'media', descripcion: 'Media' }
}
