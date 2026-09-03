import { useState } from 'react'
import { registrarPagoMock } from './inscripcionesMock'
import { toastError, toastSuccess } from '../../../lib/alerts'
import {
  claseBadgeEstado,
  formatFecha,
  formatMonto,
  nombreAlumno,
  nombreMateria,
  puedeDarDeBaja,
} from './inscripcionHelpers'
import '../personas/personas.css'
import './inscripciones.css'

function hoyISO() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function validatePagoField(name, value) {
  const v = String(value ?? '').trim()
  if (name === 'monto') {
    if (!v) return 'El monto es obligatorio.'
    const n = Number(v)
    if (Number.isNaN(n) || !/^-?\d+(\.\d+)?$/.test(v)) return 'El monto debe ser un número.'
    if (n <= 0) return 'El monto debe ser positivo.'
    return ''
  }
  if (name === 'metodoPago') return v ? '' : 'El método de pago es obligatorio.'
  if (name === 'fechaPago') return v ? '' : 'La fecha de pago es obligatoria.'
  return ''
}

const FORM_VACIO = {
  monto: '',
  metodoPago: '',
  fechaPago: hoyISO(),
  estado: 'Confirmado',
  comprobante: '',
}

export function InscripcionDetailModal({ inscripcion, onClose, onPagoRegistrado, onDarDeBaja }) {
  const [form, setForm] = useState(FORM_VACIO)
  const [touched, setTouched] = useState({})
  const [enviando, setEnviando] = useState(false)

  if (!inscripcion) return null

  const estado = inscripcion.estado || '—'
  const clasesTomadas = inscripcion.clasesTomadas ?? 0
  const clasesTotales = inscripcion.clasesTotales ?? 0
  const montoPagado = inscripcion.montoPagado ?? 0
  const pagos = [...(inscripcion.pagos || [])].sort(
    (a, b) => new Date(b.fechaPago) - new Date(a.fechaPago),
  )
  const bajaHabilitada = puedeDarDeBaja(estado)

  const handleBlur = (e) => setTouched((prev) => ({ ...prev, [e.target.name]: true }))

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setTouched((prev) => ({ ...prev, [name]: true }))
  }

  const getInputClass = (name) => {
    const err = validatePagoField(name, form[name])
    if (!touched[name] && !form[name]) return 'input-field'
    return err ? 'input-field field-err' : 'input-field field-ok'
  }

  const getSelectClass = (name) => {
    const err = validatePagoField(name, form[name])
    if (!touched[name] && !form[name]) return 'select-field'
    return err ? 'select-field field-err' : 'select-field field-ok'
  }

  const renderError = (name) => {
    const err = validatePagoField(name, form[name])
    return touched[name] && err ? <div className="emsg">{err}</div> : null
  }

  const handlePago = (e) => {
    e.preventDefault()
    const campos = ['monto', 'metodoPago', 'fechaPago']
    setTouched((prev) => ({ ...prev, ...Object.fromEntries(campos.map((k) => [k, true])) }))

    for (const f of campos) {
      const err = validatePagoField(f, form[f])
      if (err) {
        toastError({ title: 'Validación', text: err })
        return
      }
    }

    setEnviando(true)
    try {
      // CA03 — asociado a InscripcionMateriaId y PersonaId (lo resuelve el mock)
      const actualizada = registrarPagoMock(inscripcion.id, {
        monto: Number(form.monto),
        metodoPago: form.metodoPago,
        fechaPago: form.fechaPago,
        estado: form.estado || 'Confirmado',
        comprobante: form.comprobante.trim() || null,
      })
      toastSuccess({
        text: form.estado === 'Confirmado'
          ? 'Pago confirmado. Se actualizó el monto pagado de la inscripción.'
          : 'Pago registrado. El monto pagado no se incrementa hasta confirmarlo.',
      })
      setForm({ ...FORM_VACIO, fechaPago: hoyISO() })
      setTouched({})
      // CA05 — recarga detalle + historial
      onPagoRegistrado?.(actualizada)
    } catch (error) {
      toastError({ title: 'Error', text: error.message || 'No se pudo registrar el pago.' })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="detail-modal-card detail-modal-card--pago" onClick={(e) => e.stopPropagation()}>
        <div className="detail-header">
          <div>
            <span className="detail-rol-badge rol-alumno">Inscripción</span>
            <h2 className="detail-name">{nombreAlumno(inscripcion)}</h2>
            <div className="detail-dni-sub">
              {nombreMateria(inscripcion)}
              {inscripcion.alumnoDni ? ` · DNI ${inscripcion.alumnoDni}` : ''}
            </div>
          </div>
          <button className="detail-close-btn" onClick={onClose} aria-label="Cerrar">&times;</button>
        </div>

        <div className="detail-body">
          <div className="detail-section">
            <h3 className="detail-section-title">Cursada</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Fecha de inscripción</span>
                <span className="detail-value">{formatFecha(inscripcion.fechaInscripcion)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Estado</span>
                <span className={`badge ${claseBadgeEstado(estado)}`}>{estado}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Clases tomadas / totales</span>
                <span className="detail-value highlight-val">{clasesTomadas} / {clasesTotales}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Monto pagado</span>
                <span className="detail-value highlight-val">{formatMonto(montoPagado)}</span>
              </div>
            </div>
          </div>

          {/* CA05 — historial de pagos */}
          <div className="detail-section highlight-sec">
            <h3 className="detail-section-title">Historial de pagos</h3>
            {pagos.length === 0 ? (
              <div className="pagoItemMeta">Todavía no hay pagos registrados.</div>
            ) : (
              <ul className="pagosList">
                {pagos.map((p) => (
                  <li key={p.id} className="pagoItem">
                    <div>
                      <div className="fw-600">{formatMonto(p.monto)}</div>
                      <div className="pagoItemMeta">
                        {p.metodoPago} · {formatFecha(p.fechaPago)}
                        {p.comprobante ? ` · Comp. ${p.comprobante}` : ''}
                      </div>
                    </div>
                    <div className={`badge ${String(p.estado).toLowerCase() === 'confirmado' ? 'activa' : 'suspendida'}`}>
                      {p.estado}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* HU20 — prototipo en modal del detalle */}
          <div className="detail-section">
            <h3 className="detail-section-title">Registrar pago</h3>
            <p className="inscHint">
              El pago se asocia a esta inscripción y al alumno. Si el estado es Confirmado, se suma al monto pagado.
            </p>
            <form className="pagoForm" onSubmit={handlePago} noValidate>
              <div className="formGrid">
                <div className="formGroup">
                  <label>Monto *</label>
                  <input
                    name="monto"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={form.monto}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getInputClass('monto')}
                  />
                  {renderError('monto')}
                </div>
                <div className="formGroup">
                  <label>Método de pago *</label>
                  <select
                    name="metodoPago"
                    value={form.metodoPago}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getSelectClass('metodoPago')}
                  >
                    <option value="">Seleccionar…</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia</option>
                    <option value="Tarjeta">Tarjeta</option>
                    <option value="Mercado Pago">Mercado Pago</option>
                  </select>
                  {renderError('metodoPago')}
                </div>
                <div className="formGroup">
                  <label>Fecha de pago *</label>
                  <input
                    name="fechaPago"
                    type="date"
                    value={form.fechaPago}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getInputClass('fechaPago')}
                  />
                  {renderError('fechaPago')}
                </div>
                <div className="formGroup">
                  <label>Estado del pago</label>
                  <select
                    name="estado"
                    value={form.estado}
                    onChange={handleChange}
                    className="select-field"
                  >
                    <option value="Confirmado">Confirmado</option>
                    <option value="Pendiente">Pendiente</option>
                  </select>
                </div>
                <div className="formGroup full-width">
                  <label>Comprobante</label>
                  <input
                    name="comprobante"
                    className="input-field"
                    value={form.comprobante}
                    onChange={handleChange}
                    placeholder="Nº de comprobante (opcional)"
                  />
                </div>
              </div>
              <div className="formActions" style={{ marginTop: 4, paddingTop: 10, borderTop: '1px solid var(--border-2)' }}>
                <button type="submit" className="btn primary" disabled={enviando}>
                  {enviando ? 'Registrando…' : 'Registrar pago'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="detail-footer" style={{ justifyContent: 'space-between', gap: 8 }}>
          <button
            type="button"
            className="btn danger"
            onClick={onDarDeBaja}
            title={bajaHabilitada ? 'Dar de baja' : 'La inscripción ya se encuentra inactiva'}
          >
            Dar de baja
          </button>
          <button className="btn outline" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  )
}
