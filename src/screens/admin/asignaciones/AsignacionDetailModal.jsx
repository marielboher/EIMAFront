import { AlumnosGrupoSection } from './AlumnosGrupoSection'
import { cuposDe, formatFechaHora, textoCupo } from './asignacionHelpers'
import '../personas/personas.css'
import './asignacionesAula.css'

export function AsignacionDetailModal({ asignacion, onClose, onCerrarAsignacion, onCupoActualizado }) {
  if (!asignacion) return null

  const abierta = String(asignacion.estado || '').toLowerCase() === 'abierta'
  const cupo = cuposDe(asignacion)

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="detail-modal-card asignacion-detail-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="asignacion-detalle-titulo"
      >
        <div className="detail-header">
          <div>
            <span className="detail-rol-badge rol-admin">Asignación de aula</span>
            <h2 id="asignacion-detalle-titulo" className="detail-name">{asignacion.aulaNombre}</h2>
            <div className="detail-dni-sub">
              {asignacion.materiaNombre}
              {asignacion.docenteNombre ? ` · ${asignacion.docenteNombre}` : ''}
            </div>
          </div>
          <button type="button" className="detail-close-btn" onClick={onClose} aria-label="Cerrar">
            &times;
          </button>
        </div>

        <div className="detail-body">
          <div className="detail-section">
            <h3 className="detail-section-title">Grupo</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">ID</span>
                <span className="detail-value">#{asignacion.id}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Estado</span>
                <span className={`badge ${abierta ? 'abierta' : 'cerrada'}`}>{asignacion.estado}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Aula</span>
                <span className="detail-value">{asignacion.aulaNombre}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Capacidad del aula</span>
                <span className="detail-value">{asignacion.capacidadAula ?? '—'}</span>
              </div>
              <div className="detail-item full-width">
                <span className="detail-label">Materia</span>
                <span className="detail-value">{asignacion.materiaNombre}</span>
              </div>
              <div className="detail-item full-width">
                <span className="detail-label">Docente</span>
                <span className="detail-value">
                  {asignacion.docenteNombre}
                  {asignacion.docenteDni ? ` · DNI ${asignacion.docenteDni}` : ''}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Cupo (ocupados / habilitado)</span>
                <span className="detail-value highlight-val">
                  {textoCupo(asignacion)}
                  {cupo.completo ? ' · Cupo completo' : ` · ${cupo.disponibles} disponibles`}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Fin de vigencia</span>
                <span className="detail-value">{formatFechaHora(asignacion.finVigencia)}</span>
              </div>
            </div>
          </div>

          <div className="detail-section meta-sec">
            <h3 className="detail-section-title">Trazabilidad</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Fecha de asignación</span>
                <span className="detail-value">{formatFechaHora(asignacion.fechaAsignacion)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Fecha de cierre</span>
                <span className="detail-value">{formatFechaHora(asignacion.fechaCierre)}</span>
              </div>
            </div>
          </div>

          <AlumnosGrupoSection asignacion={asignacion} onCupoActualizado={onCupoActualizado} />
        </div>

        <div className="detail-footer">
          <button type="button" className="btn outline" onClick={onClose}>
            Volver al listado
          </button>
          {abierta && onCerrarAsignacion ? (
            <button type="button" className="btn danger" onClick={() => onCerrarAsignacion(asignacion)}>
              Cerrar asignación
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
