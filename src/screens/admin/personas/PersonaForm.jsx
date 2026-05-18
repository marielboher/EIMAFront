import { useState } from 'react';
import { createPersona, updatePersona } from '../../../services/personas';
import { toastSuccess, toastError } from '../../../lib/alerts';
import './personas.css';

export function PersonaForm({ persona, onClose }) {
  const isEditing = !!persona;
  
  const getUIFriendlyRole = (dbRol) => {
    if (!dbRol) return '';
    const name = (typeof dbRol === 'string' ? dbRol : dbRol.nombre || dbRol.Nombre || '').toLowerCase();
    if (name === 'profesor') return 'docente';
    if (name === 'secretaria') return 'colaborador';
    return name;
  };

  const formatDate = (dateVal) => {
    if (!dateVal) return '';
    try {
      return new Date(dateVal).toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const [formData, setFormData] = useState({
    nombre: persona?.nombre || persona?.Nombre || '',
    apellido: persona?.apellido || persona?.Apellido || '',
    dni: persona?.dni || persona?.Dni || '',
    telefono: persona?.telefono || persona?.Telefono || '',
    direccion: persona?.direccion || persona?.Direccion || '',
    rol: getUIFriendlyRole(persona?.rol || persona?.Rol),
    // Campos Alumno
    colegio: persona?.colegio || persona?.Colegio || '',
    gradoCurso: persona?.gradoCurso || persona?.GradoCurso || '',
    nivelEducativo: persona?.nivelEducativo || persona?.NivelEducativo || '',
    // Campos Docente
    especialidades: persona?.especialidades || persona?.Especialidades || '',
    titulo: persona?.titulo || persona?.Titulo || '',
    fechaIngreso: formatDate(persona?.fechaIngresoDocente || persona?.FechaIngresoDocente),
    // Campos Colaborador
    tipoColaborador: persona?.tipoColaborador?.tipo || persona?.TipoColaborador?.Tipo || '',
    fechaContratacion: formatDate(persona?.fechaContratacion || persona?.FechaContratacion),
    salario: persona?.salario || persona?.Salario || ''
  });

  // Estado para controlar qué campos han sido interactuados (tocados)
  const [touched, setTouched] = useState({});

  // Lógica de validación en tiempo real (HU09, HU11)
  const validateField = (name, value, currentRol) => {
    const valString = String(value ?? '').trim();

    if (name === 'nombre') {
      if (!valString) return 'El nombre es obligatorio.';
      return '';
    }
    if (name === 'apellido') {
      if (!valString) return 'El apellido es obligatorio.';
      return '';
    }
    if (name === 'dni') {
      if (!valString) return 'El DNI es obligatorio.';
      if (!/^\d+$/.test(valString)) return 'El DNI debe contener solo números.';
      return '';
    }
    if (name === 'telefono') {
      if (!valString) return 'El teléfono es obligatorio.';
      if (!/^\d+$/.test(valString)) return 'El teléfono debe contener solo números.';
      if (valString.length < 7 || valString.length > 15) return 'El teléfono debe tener entre 7 y 15 dígitos.';
      return '';
    }
    if (name === 'direccion') {
      if (!valString) return 'La dirección es obligatoria.';
      return '';
    }
    if (name === 'rol') {
      if (!value) return 'Debe seleccionar un rol.';
      return '';
    }
    if (currentRol === 'colaborador') {
      if (name === 'tipoColaborador') {
        if (!valString) return 'El tipo de colaborador es obligatorio.';
      }
      if (name === 'fechaContratacion' && value) {
        if (value < '2025-01-01') {
          return 'La fecha de contratación no puede ser anterior al 01/01/2025.';
        }
      }
      if (name === 'salario' && value !== '' && value !== null && value !== undefined) {
        const sal = parseFloat(value);
        if (isNaN(sal) || sal <= 0) return 'El salario debe ser un número positivo.';
      }
    }
    return '';
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Validar en tiempo real a medida que el usuario escribe
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const getInputClass = (name) => {
    const val = formData[name];
    const err = validateField(name, val, formData.rol);
    if (!touched[name] && !val) return 'input-field';
    if (err) return 'input-field field-err';

    const isRequired = ['nombre', 'apellido', 'dni', 'telefono', 'direccion', 'rol'].includes(name) ||
                       (formData.rol === 'colaborador' && name === 'tipoColaborador');
    if (isRequired || val) {
      return 'input-field field-ok';
    }
    return 'input-field';
  };

  const getSelectClass = (name) => {
    const val = formData[name];
    const err = validateField(name, val, formData.rol);
    if (!touched[name] && !val) return 'select-field';
    if (err) return 'select-field field-err';
    if (val) return 'select-field field-ok';
    return 'select-field';
  };

  const renderError = (name) => {
    const val = formData[name];
    const err = validateField(name, val, formData.rol);
    if (touched[name] && err) {
      return <div className="emsg">{err}</div>;
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Marcar todos los campos como interactuados para mostrar validación visual de errores
    const allTouched = {};
    Object.keys(formData).forEach(k => {
      allTouched[k] = true;
    });
    setTouched(allTouched);

    // 1. Validaciones del cliente
    const basicFields = ['nombre', 'apellido', 'dni', 'telefono', 'direccion', 'rol'];
    for (const f of basicFields) {
      const err = validateField(f, formData[f], formData.rol);
      if (err) {
        toastError({ title: "Error de Validación", text: err });
        return;
      }
    }

    if (formData.rol === 'colaborador') {
      const errTipo = validateField('tipoColaborador', formData.tipoColaborador, formData.rol);
      if (errTipo) {
        toastError({ title: "Error de Validación", text: errTipo });
        return;
      }
      const errFecha = validateField('fechaContratacion', formData.fechaContratacion, formData.rol);
      if (errFecha) {
        toastError({ title: "Error de Validación", text: errFecha });
        return;
      }
      const errSal = validateField('salario', formData.salario, formData.rol);
      if (errSal) {
        toastError({ title: "Error de Validación", text: errSal });
        return;
      }
    }

    try {
      const payload = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        dni: formData.dni,
        telefono: formData.telefono,
        direccion: formData.direccion,
        rol: formData.rol,
        // Alumno
        colegio: formData.rol === 'alumno' ? formData.colegio : null,
        gradoCurso: formData.rol === 'alumno' ? formData.gradoCurso : null,
        nivelEducativo: formData.rol === 'alumno' ? formData.nivelEducativo : null,
        // Docente
        especialidades: formData.rol === 'docente' ? formData.especialidades : null,
        titulo: formData.rol === 'docente' ? formData.titulo : null,
        fechaIngresoDocente: formData.rol === 'docente' && formData.fechaIngreso ? formData.fechaIngreso : null,
        // Colaborador
        tipoColaborador: formData.rol === 'colaborador' ? formData.tipoColaborador : null,
        fechaContratacion: formData.rol === 'colaborador' && formData.fechaContratacion ? formData.fechaContratacion : null,
        salario: formData.rol === 'colaborador' && formData.salario ? parseFloat(formData.salario) : null
      };

      if (isEditing) {
        await updatePersona(persona.id || persona.Id, payload);
        toastSuccess({ text: "Datos actualizados exitosamente." });
        onClose(true);
      } else {
        await createPersona(payload);
        toastSuccess({ text: "Persona registrada exitosamente." });
        
        // Limpieza de campos tras el alta correcta (HU08 - CA04)
        setFormData({
          nombre: '',
          apellido: '',
          dni: '',
          telefono: '',
          direccion: '',
          rol: '',
          colegio: '',
          gradoCurso: '',
          nivelEducativo: '',
          especialidades: '',
          titulo: '',
          fechaIngreso: '',
          tipoColaborador: '',
          fechaContratacion: '',
          salario: ''
        });
        setTouched({});
        
        onClose(true); // Indicar que se registró y refrescar la tabla
      }
    } catch (error) {
      console.error(error);
      const backendError = error.response?.data?.errores?.[0]?.mensaje 
        || error.response?.data?.mensaje 
        || "Ocurrió un error al procesar los datos de la persona.";
      toastError({ title: isEditing ? "Error al Guardar" : "Error en el Alta", text: backendError });
    }
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

        <form onSubmit={handleSubmit} className="personaForm" noValidate>
          <h3 className="sectionTitle">Datos Básicos</h3>
          <div className="formGrid">
            <div className="formGroup">
              <label>Nombre *</label>
              <input required name="nombre" value={formData.nombre} onChange={handleChange} onBlur={handleBlur} className={getInputClass('nombre')} />
              {renderError('nombre')}
            </div>
            <div className="formGroup">
              <label>Apellido *</label>
              <input required name="apellido" value={formData.apellido} onChange={handleChange} onBlur={handleBlur} className={getInputClass('apellido')} />
              {renderError('apellido')}
            </div>
            <div className="formGroup">
              <label>DNI *</label>
              <input required name="dni" type="text" inputMode="numeric" value={formData.dni} onChange={handleChange} onBlur={handleBlur} className={getInputClass('dni')} />
              {renderError('dni')}
            </div>
            <div className="formGroup">
              <label>Teléfono *</label>
              <input required name="telefono" type="tel" value={formData.telefono} onChange={handleChange} onBlur={handleBlur} className={getInputClass('telefono')} />
              {renderError('telefono')}
            </div>
            <div className="formGroup full-width">
              <label>Dirección *</label>
              <input required name="direccion" value={formData.direccion} onChange={handleChange} onBlur={handleBlur} className={getInputClass('direccion')} />
              {renderError('direccion')}
            </div>
            <div className="formGroup full-width">
              <label>Rol Asignado *</label>
              <select required name="rol" value={formData.rol} onChange={handleChange} onBlur={handleBlur} className={getSelectClass('rol')} disabled={isEditing}>
                <option value="" disabled>Seleccione un rol...</option>
                <option value="alumno">Alumno</option>
                <option value="docente">Docente</option>
                <option value="colaborador">Colaborador</option>
              </select>
              {renderError('rol')}
            </div>
          </div>

          {/* Campos específicos según el rol (HU10) */}
          {formData.rol === 'alumno' && (
            <>
              <h3 className="sectionTitle">Datos Académicos (Alumno)</h3>
              <div className="formGrid">
                <div className="formGroup full-width">
                  <label>Colegio</label>
                  <input name="colegio" value={formData.colegio} onChange={handleChange} onBlur={handleBlur} className={getInputClass('colegio')} />
                  {renderError('colegio')}
                </div>
                <div className="formGroup">
                  <label>Grado / Curso</label>
                  <input name="gradoCurso" value={formData.gradoCurso} onChange={handleChange} onBlur={handleBlur} className={getInputClass('gradoCurso')} />
                  {renderError('gradoCurso')}
                </div>
                <div className="formGroup">
                  <label>Nivel Educativo</label>
                  <select name="nivelEducativo" value={formData.nivelEducativo} onChange={handleChange} onBlur={handleBlur} className={getSelectClass('nivelEducativo')}>
                    <option value="">Seleccionar...</option>
                    <option value="primario">Primario</option>
                    <option value="secundario">Secundario</option>
                  </select>
                  {renderError('nivelEducativo')}
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
                  <input name="especialidades" value={formData.especialidades} onChange={handleChange} onBlur={handleBlur} className={getInputClass('especialidades')} placeholder="Ej: Matemáticas, Física" />
                  {renderError('especialidades')}
                </div>
                <div className="formGroup">
                  <label>Título</label>
                  <input name="titulo" value={formData.titulo} onChange={handleChange} onBlur={handleBlur} className={getInputClass('titulo')} />
                  {renderError('titulo')}
                </div>
                <div className="formGroup">
                  <label>Fecha de Ingreso</label>
                  <input type="date" name="fechaIngreso" value={formData.fechaIngreso} onChange={handleChange} onBlur={handleBlur} className={getInputClass('fechaIngreso')} />
                  {renderError('fechaIngreso')}
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
                  <input required name="tipoColaborador" value={formData.tipoColaborador} onChange={handleChange} onBlur={handleBlur} className={getInputClass('tipoColaborador')} placeholder="Ej: Secretaría, Mantenimiento" />
                  {renderError('tipoColaborador')}
                </div>
                <div className="formGroup">
                  <label>Fecha Contratación <span style={{ fontSize: '11px', fontWeight: 'normal', color: 'var(--muted-2)', marginLeft: '4px' }}>(Mínimo: 01/01/2025)</span></label>
                  <input type="date" name="fechaContratacion" min="2025-01-01" value={formData.fechaContratacion} onChange={handleChange} onBlur={handleBlur} className={getInputClass('fechaContratacion')} />
                  {renderError('fechaContratacion')}
                </div>
                <div className="formGroup">
                  <label>Salario Base ($)</label>
                  <input type="number" min="0" step="0.01" name="salario" value={formData.salario} onChange={handleChange} onBlur={handleBlur} className={getInputClass('salario')} />
                  {renderError('salario')}
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
