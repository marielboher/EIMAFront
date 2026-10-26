export const ESTADOS_ASIGNACION = ['Abierta', 'Cerrada']

function pad2(n) {
  return String(n).padStart(2, '0')
}

export function formatFechaHora(valor) {
  if (!valor) return '—'
  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) return '—'
  return fecha.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Convierte un instante ISO al valor `YYYY-MM-DD` en hora local para <input type="date">. */
export function fechaIsoAInput(valor) {
  if (!valor) return ''
  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) return ''
  return `${fecha.getFullYear()}-${pad2(fecha.getMonth() + 1)}-${pad2(fecha.getDate())}`
}

/** Convierte `YYYY-MM-DD` (hora local) al instante ISO del inicio o del fin del día. */
export function inputAFechaIso(valor, { finDelDia = false } = {}) {
  if (!valor) return undefined
  const sufijo = finDelDia ? 'T23:59:59.999' : 'T00:00:00'
  const fecha = new Date(`${valor}${sufijo}`)
  if (Number.isNaN(fecha.getTime())) return undefined
  return fecha.toISOString()
}

/** Valor compatible con <input type="datetime-local"> en hora local. */
export function fechaHoraLocalInput(fecha = new Date()) {
  const d = fecha instanceof Date ? fecha : new Date(fecha)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

export function minFechaHoraLocal() {
  return fechaHoraLocalInput(new Date())
}

export function claseBadgeEstado(estado) {
  return String(estado || '').toLowerCase() === 'abierta' ? 'abierta' : 'cerrada'
}

export function esAbierta(estado) {
  return String(estado || '').toLowerCase() === 'abierta'
}

export function textoCupo(row) {
  const ocupados = Number(row?.cuposOcupados ?? row?.CuposOcupados ?? 0)
  const habilitado = Number(row?.cupoHabilitado ?? row?.CupoHabilitado ?? 0)
  return `${ocupados} / ${habilitado}`
}

export function nombreAsignacion(row) {
  const aula = row?.aulaNombre || row?.AulaNombre || '—'
  const materia = row?.materiaNombre || row?.MateriaNombre || '—'
  return { aula, materia }
}
