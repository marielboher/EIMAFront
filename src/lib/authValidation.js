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
