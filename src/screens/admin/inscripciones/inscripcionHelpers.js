export const ESTADOS_INSCRIPCION = ['Activa', 'Finalizada', 'Suspendida', 'Cancelada']

export function formatFecha(fechaStr) {
  if (!fechaStr) return '—'
  try {
    const date = new Date(fechaStr)
    if (Number.isNaN(date.getTime())) return '—'
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

export function formatMonto(valor) {
  const n = Number(valor)
  if (Number.isNaN(n)) return '$0,00'
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
}

export function nombreAlumno(row) {
  if (row.alumno) return row.alumno
  const p = row.persona || row.Persona
  if (!p) return '—'
  const apellido = p.apellido || p.Apellido || ''
  const nombre = p.nombre || p.Nombre || ''
  return `${apellido}${apellido && nombre ? ', ' : ''}${nombre}`.trim() || '—'
}

export function nombreMateria(row) {
  return row.materia
    || row.materiaInfo?.nombre
    || row.materiaInfo?.Nombre
    || row.materia?.nombre
    || row.Materia?.Nombre
    || '—'
}

export function claseBadgeEstado(estado) {
  const e = String(estado || '').toLowerCase()
  if (e === 'activa') return 'activa'
  if (e === 'finalizada') return 'finalizada'
  if (e === 'suspendida') return 'suspendida'
  if (e === 'cancelada') return 'cancelada'
  return 'default'
}

export function puedeDarDeBaja(estado) {
  const e = String(estado || '').toLowerCase()
  return e === 'activa' || e === 'suspendida'
}

export function inscripcionYaInactiva(estado) {
  const e = String(estado || '').toLowerCase()
  return e === 'finalizada' || e === 'cancelada'
}
