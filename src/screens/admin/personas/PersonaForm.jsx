import { useState } from 'react';
import './personas.css';

export function PersonaForm({ persona, onClose }) {
  const isEditing = !!persona;
  
  const [formData, setFormData] = useState({
    nombre: persona?.nombre || '',
    apellido: persona?.apellido || '',
    dni: persona?.dni || '',
    telefono: persona?.telefono || '',
    direccion: persona?.direccion || '',
    rol: persona?.rol || '',
    // Campos Alumno
    colegio: '',
    gradoCurso: '',
    nivelEducativo: '',
    // Campos Docente
    especialidades: '',
    titulo: '',
    fechaIngreso: '',
    // Campos Colaborador
    tipoColaborador: '',
    fechaContratacion: '',
    salario: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí irían las validaciones (HU09) antes de enviar a la API
    console.log("Enviando datos:", formData);
    onClose();
  };

  return (
    <div className="personasWrap">
      <div className="personasPanel" style={{ width: '100%', maxWidth: '600px' }}>
        <div className="panelHeader">
          <div>
            <div className="panelTitle">{isEditing ? 'Editar Persona' : 'Alta de Persona'}</div>
            <div className="panelSub">
              {isEditing ? `Modificando los datos de ${persona.nombre} ${persona.apellido}` : 'Complete los campos obligatorios para registrar una nueva persona.'}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="personaForm">
          <h3 className="sectionTitle">Datos Básicos</h3>
          <div className="formGrid">
            <div className="formGroup">
              <label>Nombre *</label>
              <input required name="nombre" value={formData.nombre} onChange={handleChange} className="input-field" />
            </div>
            <div className="formGroup">
              <label>Apellido *</label>
              <input required name="apellido" value={formData.apellido} onChange={handleChange} className="input-field" />
            </div>
            <div className="formGroup">
              <label>DNI *</label>
              <input required name="dni" type="number" value={formData.dni} onChange={handleChange} className="input-field" />
            </div>
            <div className="formGroup">
              <label>Teléfono *</label>
              <input required name="telefono" type="tel" value={formData.telefono} onChange={handleChange} className="input-field" />
            </div>
            <div className="formGroup full-width">
              <label>Dirección</label>
              <input name="direccion" value={formData.direccion} onChange={handleChange} className="input-field" />
            </div>
            <div className="formGroup full-width">
              <label>Rol Asignado *</label>
              <select required name="rol" value={formData.rol} onChange={handleChange} className="select-field" disabled={isEditing}>
                <option value="" disabled>Seleccione un rol...</option>
                <option value="alumno">Alumno</option>
                <option value="docente">Docente</option>
                <option value="colaborador">Colaborador</option>
              </select>
            </div>
          </div>

          {/* Campos específicos según el rol (HU10) */}
          {formData.rol === 'alumno' && (
            <>
              <h3 className="sectionTitle">Datos Académicos (Alumno)</h3>
              <div className="formGrid">
                <div className="formGroup full-width">
                  <label>Colegio</label>
                  <input name="colegio" value={formData.colegio} onChange={handleChange} className="input-field" />
                </div>
                <div className="formGroup">
                  <label>Grado / Curso</label>
                  <input name="gradoCurso" value={formData.gradoCurso} onChange={handleChange} className="input-field" />
                </div>
                <div className="formGroup">
                  <label>Nivel Educativo</label>
                  <select name="nivelEducativo" value={formData.nivelEducativo} onChange={handleChange} className="select-field">
                    <option value="">Seleccionar...</option>
                    <option value="primario">Primario</option>
                    <option value="secundario">Secundario</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {formData.rol === 'docente' && (
            <>
              <h3 className="sectionTitle">Datos Profesionales (Docente)</h3>
              <div className="formGrid">
                <div className="formGroup full-width">
                  <label>Especialidades</label>
                  <input name="especialidades" value={formData.especialidades} onChange={handleChange} className="input-field" placeholder="Ej: Matemáticas, Física" />
                </div>
                <div className="formGroup">
                  <label>Título</label>
                  <input name="titulo" value={formData.titulo} onChange={handleChange} className="input-field" />
                </div>
                <div className="formGroup">
                  <label>Fecha de Ingreso</label>
                  <input type="date" name="fechaIngreso" value={formData.fechaIngreso} onChange={handleChange} className="input-field" />
                </div>
              </div>
            </>
          )}

          {formData.rol === 'colaborador' && (
            <>
              <h3 className="sectionTitle">Datos Laborales (Colaborador)</h3>
              <div className="formGrid">
                <div className="formGroup full-width">
                  <label>Tipo de Colaborador *</label>
                  <input required name="tipoColaborador" value={formData.tipoColaborador} onChange={handleChange} className="input-field" placeholder="Ej: Secretaría, Mantenimiento" />
                </div>
                <div className="formGroup">
                  <label>Fecha Contratación</label>
                  <input type="date" name="fechaContratacion" value={formData.fechaContratacion} onChange={handleChange} className="input-field" />
                </div>
                <div className="formGroup">
                  <label>Salario Base ($)</label>
                  <input type="number" min="0" step="0.01" name="salario" value={formData.salario} onChange={handleChange} className="input-field" />
                </div>
              </div>
            </>
          )}

          <div className="formActions">
            <button type="button" className="btn outline" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn primary">{isEditing ? 'Guardar Cambios' : 'Registrar Persona'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
