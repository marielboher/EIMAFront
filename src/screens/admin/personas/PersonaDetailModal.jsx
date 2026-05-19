import React from 'react';
import './personas.css';

const formatFechaDetalle = (fechaStr) => {
  if (!fechaStr) return '—';
  try {
    const date = new Date(fechaStr);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return '—';
  }
};

const formatFechaSimple = (fechaStr) => {
  if (!fechaStr) return '—';
  try {
    const date = new Date(fechaStr);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (e) {
    return '—';
  }
};

export function PersonaDetailModal({ persona, onClose }) {
  if (!persona) return null;

  const getRolString = (p) => {
    if (!p) return '';
    const r = p.rol ?? p.Rol;
    if (!r) return '';
    if (typeof r === 'object') {
      return String(r.nombre ?? r.Nombre ?? '').trim().toLowerCase();
    }
    return String(r).trim().toLowerCase();
  };

  const rolLower = getRolString(persona);
  const esAlumno = rolLower === 'alumno';
  const esProfesor = rolLower === 'profesor' || rolLower === 'docente';
  const esAdministrativo = rolLower === 'administrativo' || rolLower === 'secretaria' || rolLower === 'colaborador';

  // Obtener etiqueta y color de rol
  const getRolTag = () => {
    switch (rolLower) {
      case 'alumno':
        return { text: 'Alumno', className: 'rol-alumno' };
      case 'profesor':
      case 'docente':
        return { text: 'Profesor', className: 'rol-profesor' };
      case 'administrativo':
      case 'secretaria':
      case 'colaborador':
        return { text: 'Administrativo', className: 'rol-admin' };
      default:
        const rawRole = persona.rol ?? persona.Rol;
        const displayName = typeof rawRole === 'object'
          ? (rawRole.nombre ?? rawRole.Nombre ?? 'Usuario')
          : (rawRole || 'Usuario');
        return { text: displayName, className: 'rol-default' };
    }
  };

  const rolTag = getRolTag();

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="detail-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="detail-header">
          <div>
            <span className={`detail-rol-badge ${rolTag.className}`}>{rolTag.text}</span>
            <h2 className="detail-name">
              {(persona.nombre || persona.Nombre || '')} {(persona.apellido || persona.Apellido || '')}
            </h2>
            <div className="detail-dni-sub">DNI: {persona.dni || persona.Dni || '—'}</div>
          </div>
          <button className="detail-close-btn" onClick={onClose} aria-label="Cerrar Ficha">&times;</button>
        </div>

        <div className="detail-body">
          {/* Información de Contacto */}
          <div className="detail-section">
            <h3 className="detail-section-title">Información de Contacto</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Teléfono</span>
                <span className="detail-value">{persona.telefono || persona.Telefono || '—'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Correo Electrónico</span>
                <span className="detail-value">{persona.cuentaUsuario?.correoElectronico || persona.CuentaUsuario?.CorreoElectronico || '—'}</span>
              </div>
              <div className="detail-item full-width">
                <span className="detail-label">Dirección</span>
                <span className="detail-value">{persona.direccion || persona.Direccion || '—'}</span>
              </div>
            </div>
          </div>

          {/* Información Específica según Rol */}
          {esAlumno && (
            <div className="detail-section highlight-sec">
              <h3 className="detail-section-title">Datos Académicos (Alumno)</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Colegio</span>
                  <span className="detail-value">{persona.colegio || persona.Colegio || '—'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Grado / Curso</span>
                  <span className="detail-value">{persona.gradoCurso || persona.GradoCurso || '—'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Nivel Educativo</span>
                  <span className="detail-value capitalize">{persona.nivelEducativo || persona.NivelEducativo || '—'}</span>
                </div>
              </div>
            </div>
          )}

          {esProfesor && (
            <div className="detail-section highlight-sec">
              <h3 className="detail-section-title">Datos Profesionales & Tarifas (Profesor)</h3>
              <div className="detail-grid">
                <div className="detail-item full-width">
                  <span className="detail-label">Especialidades</span>
                  <span className="detail-value">{persona.especialidades || persona.Especialidades || '—'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Título</span>
                  <span className="detail-value">{persona.titulo || persona.Titulo || '—'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Fecha de Ingreso</span>
                  <span className="detail-value">{formatFechaSimple(persona.fechaIngresoDocente || persona.FechaIngresoDocente)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Horas Semanales</span>
                  <span className="detail-value">{persona.cantidadHoras ?? persona.CantidadHoras ?? '—'} hs</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Valor Clase por Hora</span>
                  <span className="detail-value highlight-val">
                    {(persona.valorClasePorHora ?? persona.ValorClasePorHora) !== undefined 
                      ? `$${Number(persona.valorClasePorHora ?? persona.ValorClasePorHora).toLocaleString('es-AR', { minimumFractionDigits: 2 })}` 
                      : '—'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Valor Curso Completo</span>
                  <span className="detail-value highlight-val">
                    {(persona.valorCursoCompleto ?? persona.ValorCursoCompleto) !== undefined 
                      ? `$${Number(persona.valorCursoCompleto ?? persona.ValorCursoCompleto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}` 
                      : '—'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Mínimo Alumnos para Grupo</span>
                  <span className="detail-value">{persona.minimoAlumnosGrupo ?? persona.MinimoAlumnosGrupo ?? '—'} alumnos</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Descuento Grupo</span>
                  <span className="detail-value percent-val">
                    {(persona.porcentajeDescuentoGrupo ?? persona.PorcentajeDescuentoGrupo) !== undefined 
                      ? `${Number(persona.porcentajeDescuentoGrupo ?? persona.PorcentajeDescuentoGrupo)}%` 
                      : '—'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {esAdministrativo && (
            <div className="detail-section highlight-sec">
              <h3 className="detail-section-title">Datos Laborales (Administrativo)</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Tipo de Administrativo</span>
                  <span className="detail-value capitalize">
                    {typeof (persona.tipoColaborador ?? persona.TipoColaborador) === 'object'
                      ? ((persona.tipoColaborador?.tipo ?? persona.TipoColaborador?.Tipo) || '—')
                      : (persona.tipoColaborador ?? persona.TipoColaborador ?? '—')}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Fecha de Contratación</span>
                  <span className="detail-value">{formatFechaSimple(persona.fechaContratacion || persona.FechaContratacion)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Salario</span>
                  <span className="detail-value highlight-val">
                    {(persona.salario ?? persona.Salario) !== undefined 
                      ? `$${Number(persona.salario ?? persona.Salario).toLocaleString('es-AR', { minimumFractionDigits: 2 })}` 
                      : '—'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Metadata del Sistema */}
          <div className="detail-section meta-sec">
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Estado de Ficha</span>
                <span className={`detail-status-badge ${persona.activo ? 'activo' : 'inactivo'}`}>
                  {persona.activo ? 'Activo' : 'Baja'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Fecha de Registro (Alta)</span>
                <span className="detail-value">{formatFechaDetalle(persona.fechaRegistro || persona.FechaRegistro)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="detail-footer">
          <button className="btn outline" onClick={onClose}>Cerrar Ficha</button>
        </div>
      </div>
    </div>
  );
}
