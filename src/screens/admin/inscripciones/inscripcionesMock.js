import { formatMonto } from './inscripcionHelpers'

export const MATERIAS_MOCK = [
  { id: 1, nombre: 'Matemática', area: 'Exactas', activa: true },
  { id: 2, nombre: 'Lengua y Literatura', area: 'Humanidades', activa: true },
  { id: 3, nombre: 'Inglés', area: 'Idiomas', activa: true },
  { id: 4, nombre: 'Física', area: 'Exactas', activa: true },
  { id: 5, nombre: 'Historia', area: 'Humanidades', activa: true },
]

export const ALUMNOS_MOCK = [
  { id: 11, nombre: 'Lucía', apellido: 'Gómez', dni: '40111222', activo: true },
  { id: 12, nombre: 'Martín', apellido: 'Pérez', dni: '38900441', activo: true },
  { id: 13, nombre: 'Sofía', apellido: 'Ruiz', dni: '42555678', activo: true },
  { id: 14, nombre: 'Julián', apellido: 'Fernández', dni: '37888990', activo: true },
  { id: 15, nombre: 'Camila', apellido: 'Torres', dni: '41222334', activo: true },
  { id: 16, nombre: 'Nicolás', apellido: 'Alvarez', dni: '36777111', activo: true },
  { id: 17, nombre: 'Valentina', apellido: 'Morales', dni: '43000123', activo: true },
  { id: 18, nombre: 'Diego', apellido: 'Sosa', dni: '35555444', activo: false },
]

function materiaDe(id) {
  const m = MATERIAS_MOCK.find((x) => x.id === id)
  return { id: m.id, nombre: m.nombre, activa: m.activa }
}

function personaDe(id) {
  const a = ALUMNOS_MOCK.find((x) => x.id === id)
  return { id: a.id, nombre: a.nombre, apellido: a.apellido, dni: a.dni, activo: a.activo }
}

function fila({ id, personaId, materiaId, fecha, clasesTotales, clasesTomadas, estado, pagos = [] }) {
  const persona = personaDe(personaId)
  const materiaInfo = materiaDe(materiaId)
  const montoPagado = pagos
    .filter((p) => String(p.estado || '').toLowerCase() === 'confirmado')
    .reduce((acc, p) => acc + Number(p.monto || 0), 0)
  return {
    id,
    personaId,
    materiaId,
    fechaInscripcion: fecha,
    clasesTotales,
    clasesTomadas,
    estado,
    montoPagado,
    alumno: `${persona.apellido}, ${persona.nombre}`,
    alumnoDni: persona.dni,
    materia: materiaInfo.nombre,
    persona,
    materiaInfo,
    pagos,
  }
}

let nextId = 9
let nextPagoId = 20

let store = [
  fila({
    id: 1, personaId: 11, materiaId: 1, fecha: '2026-03-04T12:00:00.000Z',
    clasesTotales: 8, clasesTomadas: 3, estado: 'Activa',
    pagos: [
      { id: 1, monto: 15000, metodoPago: 'Transferencia', fechaPago: '2026-03-05T15:00:00.000Z', estado: 'Confirmado' },
      { id: 2, monto: 8000, metodoPago: 'Efectivo', fechaPago: '2026-04-02T18:00:00.000Z', estado: 'Confirmado' },
    ],
  }),
  fila({
    id: 2, personaId: 12, materiaId: 3, fecha: '2026-03-10T12:00:00.000Z',
    clasesTotales: 12, clasesTomadas: 4, estado: 'Activa',
  }),
  fila({
    id: 3, personaId: 13, materiaId: 2, fecha: '2026-02-18T12:00:00.000Z',
    clasesTotales: 10, clasesTomadas: 2, estado: 'Suspendida',
    pagos: [
      { id: 3, monto: 12000, metodoPago: 'Mercado Pago', fechaPago: '2026-02-20T11:00:00.000Z', estado: 'Confirmado' },
    ],
  }),
  fila({
    id: 4, personaId: 14, materiaId: 4, fecha: '2025-11-02T12:00:00.000Z',
    clasesTotales: 16, clasesTomadas: 16, estado: 'Finalizada',
    pagos: [
      { id: 4, monto: 40000, metodoPago: 'Tarjeta', fechaPago: '2025-11-03T10:00:00.000Z', estado: 'Confirmado' },
    ],
  }),
  fila({
    id: 5, personaId: 15, materiaId: 5, fecha: '2026-01-15T12:00:00.000Z',
    clasesTotales: 8, clasesTomadas: 1, estado: 'Cancelada',
    pagos: [
      { id: 5, monto: 5000, metodoPago: 'Efectivo', fechaPago: '2026-01-16T12:00:00.000Z', estado: 'Confirmado' },
    ],
  }),
  fila({
    id: 6, personaId: 16, materiaId: 1, fecha: '2026-04-01T12:00:00.000Z',
    clasesTotales: 6, clasesTomadas: 0, estado: 'Activa',
  }),
  fila({
    id: 7, personaId: 17, materiaId: 3, fecha: '2026-03-22T12:00:00.000Z',
    clasesTotales: 8, clasesTomadas: 5, estado: 'Activa',
    pagos: [
      { id: 6, monto: 9000, metodoPago: 'Transferencia', fechaPago: '2026-03-23T09:30:00.000Z', estado: 'Pendiente' },
    ],
  }),
  fila({
    id: 8, personaId: 13, materiaId: 1, fecha: '2026-05-08T12:00:00.000Z',
    clasesTotales: 4, clasesTomadas: 1, estado: 'Suspendida',
  }),
]

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function normalizarBuscar(row, term) {
  const t = term.toLowerCase()
  const nombre = `${row.persona.nombre} ${row.persona.apellido} ${row.alumno} ${row.alumnoDni}`.toLowerCase()
  return nombre.includes(t)
}

export function listInscripcionesMock({ estado = 'todos', buscar = '', materiaId = 'todos', pagina = 1, limite = 5 } = {}) {
  let datos = store.slice()

  if (estado && estado !== 'todos') {
    datos = datos.filter((i) => i.estado.toLowerCase() === String(estado).toLowerCase())
  }
  if (buscar && buscar.trim()) {
    const term = buscar.trim()
    datos = datos.filter((i) => normalizarBuscar(i, term))
  }
  if (materiaId && materiaId !== 'todos') {
    const mid = Number(materiaId)
    datos = datos.filter((i) => i.materiaId === mid)
  }

  datos.sort((a, b) => new Date(b.fechaInscripcion) - new Date(a.fechaInscripcion))

  const totalRegistros = datos.length
  let paginasTotales = Math.ceil(totalRegistros / limite) || 1
  if (pagina < 1) pagina = 1
  if (pagina > paginasTotales) pagina = paginasTotales
  const start = (pagina - 1) * limite
  const pageRows = datos.slice(start, start + limite)

  return {
    datos: clone(pageRows),
    paginaActual: pagina,
    limite,
    totalRegistros,
    paginasTotales,
  }
}

export function getInscripcionMockById(id) {
  const row = store.find((i) => i.id === Number(id))
  return row ? clone(row) : null
}

export function createInscripcionMock({ personaId, materiaId, clasesTotales }) {
  const alumno = ALUMNOS_MOCK.find((a) => a.id === Number(personaId))
  if (!alumno || !alumno.activo) {
    throw new Error('El alumno no está disponible para inscripción.')
  }
  const materia = MATERIAS_MOCK.find((m) => m.id === Number(materiaId))
  if (!materia || !materia.activa) {
    throw new Error('La materia no está disponible.')
  }
  const duplicada = store.some(
    (i) => i.personaId === alumno.id && i.materiaId === materia.id && i.estado === 'Activa',
  )
  if (duplicada) {
    throw new Error('Ya existe una inscripción activa para ese alumno en la misma materia.')
  }
  const created = fila({
    id: nextId++,
    personaId: alumno.id,
    materiaId: materia.id,
    fecha: new Date().toISOString(),
    clasesTotales: Number(clasesTotales),
    clasesTomadas: 0,
    estado: 'Activa',
  })
  store = [created, ...store]
  return clone(created)
}

export function updateInscripcionMock(id, { clasesTotales, clasesTomadas, estado }) {
  const row = store.find((i) => i.id === Number(id))
  if (!row) throw new Error('No se encontró la inscripción.')
  row.clasesTotales = Number(clasesTotales)
  row.clasesTomadas = Number(clasesTomadas)
  row.estado = estado
  return clone(row)
}

export function pagosConfirmadosDe(inscripcion) {
  const pagos = inscripcion?.pagos || []
  return pagos.filter((p) => String(p.estado || '').toLowerCase() === 'confirmado')
}

export function montoPagosConfirmados(inscripcion) {
  return pagosConfirmadosDe(inscripcion).reduce((acc, p) => acc + Number(p.monto || 0), 0)
}

export function darDeBajaInscripcionMock(id) {
  const row = store.find((i) => i.id === Number(id))
  if (!row) throw new Error('No se encontró la inscripción.')

  const estado = row.estado
  if (estado === 'Finalizada' || estado === 'Cancelada') {
    const err = new Error('La inscripción ya se encuentra inactiva.')
    err.code = 'YA_INACTIVA'
    throw err
  }
  if (estado !== 'Activa' && estado !== 'Suspendida') {
    const err = new Error('La baja solo está disponible en inscripciones Activas o Suspendidas.')
    err.code = 'NO_HABILITADA'
    throw err
  }

  const clasesTomadas = row.clasesTomadas
  const montoPagado = row.montoPagado
  const pagos = clone(row.pagos)
  row.estado = 'Cancelada'
  row.clasesTomadas = clasesTomadas
  row.montoPagado = montoPagado
  row.pagos = pagos
  return clone(row)
}

export function registrarPagoMock(id, { monto, metodoPago, fechaPago, estado = 'Confirmado', comprobante, observaciones }) {
  const row = store.find((i) => i.id === Number(id))
  if (!row) {
    const err = new Error('No se encontró la inscripción.')
    err.code = 'INSCRIPCION_INEXISTENTE'
    throw err
  }

  const montoNum = Number(monto)
  if (monto === '' || monto == null || Number.isNaN(montoNum) || montoNum <= 0) {
    throw new Error('El monto debe ser un número positivo.')
  }
  if (!metodoPago || !String(metodoPago).trim()) {
    throw new Error('El método de pago es obligatorio.')
  }
  if (!fechaPago) {
    throw new Error('La fecha de pago es obligatoria.')
  }

  const estadoPago = String(estado || 'Confirmado').trim() || 'Confirmado'
  const pago = {
    id: nextPagoId++,
    personaId: row.personaId,
    inscripcionMateriaId: row.id,
    monto: montoNum,
    metodoPago: String(metodoPago).trim(),
    fechaPago: new Date(fechaPago).toISOString(),
    estado: estadoPago,
    comprobante: comprobante ? String(comprobante).trim() : null,
    observaciones: observaciones ? String(observaciones).trim() : null,
  }

  row.pagos = [...row.pagos, pago]
  // CA04 — solo incrementa MontoPagado si el pago queda Confirmado
  if (estadoPago.toLowerCase() === 'confirmado') {
    row.montoPagado = Number(row.montoPagado) + montoNum
  }
  return clone(row)
}

export function textoAdvertenciaBaja(inscripcion) {
  const monto = montoPagosConfirmados(inscripcion)
  if (monto <= 0) return ''
  return `Atención: hay pagos confirmados por ${formatMonto(monto)}. La baja se permite igual, pero tené en cuenta el monto ya abonado.`
}
