import { useState, useEffect, useRef } from 'react';
import { createPersona, updatePersona } from '../../../services/personas';
import { getMaterias } from '../../../services/materias';
import { toastSuccess, toastError } from '../../../lib/alerts';
import './personas.css';

// ── helpers ──────────────────────────────────────────────────────────────────

function getUIFriendlyRole(dbRol) {
  if (!dbRol) return '';
  const name = (typeof dbRol === 'string' ? dbRol : dbRol.nombre || dbRol.Nombre || '').toLowerCase();
  if (name === 'secretaria') return 'administrativo';
  return name;
}

function formatDate(dateVal) {
  if (!dateVal) return '';
  try { return new Date(dateVal).toISOString().split('T')[0]; } catch { return ''; }
}

const standardTitles = ['profesorado', 'licenciatura', 'tecnicatura', 'doctorado'];

function emptyMateria() {
  return { _key: Date.now() + Math.random(), materiaId: '', valorHora: '', cantAlumnos: '', cantHoras: '' };
}

// ── validación ────────────────────────────────────────────────────────────────

function validateField(name, value, rol, titulo) {
  const v = String(value ?? '').trim();
  if (name === 'nombre')    return v ? '' : 'El nombre es obligatorio.';
  if (name === 'apellido')  return v ? '' : 'El apellido es obligatorio.';
  if (name === 'dni') {
    if (!v) return 'El DNI es obligatorio.';
    if (!/^\d+$/.test(v)) return 'El DNI debe contener solo números.';
    return '';
  }
  if (name === 'telefono') {
    if (!v) return 'El teléfono es obligatorio.';
    if (!/^\d+$/.test(v)) return 'Solo dígitos.';
    if (v.length < 7 || v.length > 15) return 'Entre 7 y 15 dígitos.';
    return '';
  }
  if (name === 'direccion') return v ? '' : 'La dirección es obligatoria.';
  if (name === 'email') {
    if (!v) return 'El correo es obligatorio.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) return 'Formato inválido.';
    return '';
  }
  if (name === 'rol') return value ? '' : 'Debe seleccionar un rol.';

  if (rol === 'profesor') {
    if (name === 'otroTitulo' && titulo === 'otro') {
      return v ? '' : 'El nombre del título es obligatorio.';
    }
  }

  if (rol === 'administrativo') {
    if (name === 'tipoColaborador') return v ? '' : 'El tipo es obligatorio.';
    if (name === 'fechaContratacion' && value && value < '2025-01-01')
      return 'No puede ser anterior al 01/01/2025.';
    if (name === 'salario' && v !== '') {
      const n = parseFloat(v);
      if (isNaN(n) || n <= 0) return 'Debe ser un número positivo.';
    }
  }
  return '';
}

function validateMaterias(rows) {
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (!r.materiaId) return `Fila ${i + 1}: seleccioná una materia.`;
    if (r.valorHora !== '' && (isNaN(parseFloat(r.valorHora)) || parseFloat(r.valorHora) < 0))
      return `Fila ${i + 1}: valor/hora inválido.`;
    if (r.cantAlumnos !== '' && (isNaN(parseInt(r.cantAlumnos)) || parseInt(r.cantAlumnos) < 1))
      return `Fila ${i + 1}: cantidad de alumnos inválida.`;
    if (r.cantHoras !== '' && (isNaN(parseFloat(r.cantHoras)) || parseFloat(r.cantHoras) <= 0))
      return `Fila ${i + 1}: cantidad de horas inválida.`;
    // duplicado
    const ids = rows.map(x => x.materiaId).filter(Boolean);
    if (ids.indexOf(r.materiaId) !== i) return `Fila ${i + 1}: materia repetida.`;
  }
  return '';
}

// ── componente principal ──────────────────────────────────────────────────────

export function PersonaForm({ persona, onClose }) {
  const isEditing = !!persona;

  const dbTitulo = (persona?.titulo || persona?.Titulo || '').trim();
  const isCustomTitle = dbTitulo && !standardTitles.includes(dbTitulo.toLowerCase());

  const [formData, setFormData] = useState({
    nombre: persona?.nombre || persona?.Nombre || '',
    apellido: persona?.apellido || persona?.Apellido || '',
    dni: persona?.dni || persona?.Dni || '',
    telefono: persona?.telefono || persona?.Telefono || '',
    direccion: persona?.direccion || persona?.Direccion || '',
    email: persona?.cuentaUsuario?.correoElectronico || persona?.CuentaUsuario?.CorreoElectronico || '',
    rol: getUIFriendlyRole(persona?.rol || persona?.Rol),
    // Alumno
    colegio: persona?.colegio || persona?.Colegio || '',
    gradoCurso: persona?.gradoCurso || persona?.GradoCurso || '',
    nivelEducativo: persona?.nivelEducativo || persona?.NivelEducativo || '',
    // Profesor
    titulo: isCustomTitle ? 'otro' : dbTitulo.toLowerCase(),
    otroTitulo: isCustomTitle ? dbTitulo : '',
    fechaIngreso: formatDate(persona?.fechaIngresoDocente || persona?.FechaIngresoDocente),
    // Administrativo
    tipoColaborador: persona?.tipoColaborador?.tipo || persona?.TipoColaborador?.Tipo || '',
    fechaContratacion: formatDate(persona?.fechaContratacion || persona?.FechaContratacion),
    salario: persona?.salario || persona?.Salario || '',
  });

  // Grilla de materias (solo profesores)
  const initMaterias = () => {
    const pm = persona?.profesoresMaterias || persona?.ProfesoresMaterias || [];
    if (pm.length > 0) {
      return pm.map(m => ({
        _key: Math.random(),
        materiaId: String(m.materiaId || m.MateriaId || ''),
        valorHora: m.valorHora ?? m.ValorHora ?? '',
        cantAlumnos: m.cantAlumnos ?? m.CantAlumnos ?? '',
        cantHoras: m.cantHoras ?? m.CantHoras ?? '',
      }));
    }
    return [emptyMateria()];
  };

  const [materias, setMaterias] = useState(initMaterias);
  const [materiasDisponibles, setMateriasDisponibles] = useState([]);
  const [loadingMaterias, setLoadingMaterias] = useState(false);
  const [touched, setTouched] = useState({});
  const [materiasError, setMateriasError] = useState('');
  const abortRef = useRef(null);

  // Cargar materias disponibles cuando el rol es profesor
  useEffect(() => {
    if (formData.rol !== 'profesor') return;
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setLoadingMaterias(true);
    getMaterias({ signal: ac.signal })
      .then(data => {
        if (!ac.signal.aborted) setMateriasDisponibles(data);
      })
      .catch(() => {})
      .finally(() => { if (!ac.signal.aborted) setLoadingMaterias(false); });
    return () => ac.abort();
  }, [formData.rol]);

  const handleBlur = (e) => {
    setTouched(prev => ({ ...prev, [e.target.name]: true }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  // ── grilla materias ─────────────────────────────────────────────────────────

  const handleMateriaChange = (index, field, value) => {
    setMaterias(prev => prev.map((row, i) => i === index ? { ...row, [field]: value } : row));
    setMateriasError('');
  };

  const addMateria = () => setMaterias(prev => [...prev, emptyMateria()]);

  const removeMateria = (index) => {
    setMaterias(prev => {
      const next = prev.filter((_, i) => i !== index);
      return next.length === 0 ? [emptyMateria()] : next;
    });
  };

  // ── helpers de clase ────────────────────────────────────────────────────────

  const getInputClass = (name) => {
    const err = validateField(name, formData[name], formData.rol, formData.titulo);
    if (!touched[name] && !formData[name]) return 'input-field';
    return err ? 'input-field field-err' : 'input-field field-ok';
  };

  const getSelectClass = (name) => {
    const err = validateField(name, formData[name], formData.rol, formData.titulo);
    if (!touched[name] && !formData[name]) return 'select-field';
    return err ? 'select-field field-err' : 'select-field field-ok';
  };

  const renderError = (name) => {
    const err = validateField(name, formData[name], formData.rol, formData.titulo);
    return touched[name] && err ? <div className="emsg">{err}</div> : null;
  };

  // ── submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(Object.fromEntries(Object.keys(formData).map(k => [k, true])));

    const basicFields = ['nombre', 'apellido', 'dni', 'telefono', 'direccion', 'email', 'rol'];
    for (const f of basicFields) {
      const err = validateField(f, formData[f], formData.rol, formData.titulo);
      if (err) { toastError({ title: 'Validación', text: err }); return; }
    }

    if (formData.rol === 'profesor') {
      const errTitulo = validateField('otroTitulo', formData.otroTitulo, formData.rol, formData.titulo);
      if (errTitulo) { toastError({ title: 'Validación', text: errTitulo }); return; }
      const errMat = validateMaterias(materias);
      if (errMat) { toastError({ title: 'Materias', text: errMat }); setMateriasError(errMat); return; }
    }

    if (formData.rol === 'administrativo') {
      for (const f of ['tipoColaborador', 'fechaContratacion', 'salario']) {
        const err = validateField(f, formData[f], formData.rol, formData.titulo);
        if (err) { toastError({ title: 'Validación', text: err }); return; }
      }
    }

    // ── build payload ─────────────────────────────────────────────────────────
    const payload = {
      nombre: formData.nombre,
      apellido: formData.apellido,
      dni: formData.dni,
      telefono: formData.telefono,
      direccion: formData.direccion,
      correoElectronico: formData.email,
      rol: formData.rol,
      // Alumno
      colegio: formData.rol === 'alumno' ? formData.colegio : null,
      gradoCurso: formData.rol === 'alumno' ? formData.gradoCurso : null,
      nivelEducativo: formData.rol === 'alumno' ? formData.nivelEducativo : null,
      // Profesor
      titulo: formData.rol === 'profesor'
        ? (formData.titulo === 'otro' ? formData.otroTitulo : formData.titulo)
        : null,
      fechaIngresoDocente: formData.rol === 'profesor' && formData.fechaIngreso ? formData.fechaIngreso : null,
      materias: formData.rol === 'profesor'
        ? materias
            .filter(m => m.materiaId)
            .map(m => ({
              materiaId: parseInt(m.materiaId, 10),
              valorHora: m.valorHora !== '' ? parseFloat(m.valorHora) : null,
              cantAlumnos: m.cantAlumnos !== '' ? parseInt(m.cantAlumnos, 10) : null,
              cantHoras: m.cantHoras !== '' ? parseFloat(m.cantHoras) : null,
            }))
        : [],
      // Administrativo
      tipoColaborador: formData.rol === 'administrativo' ? formData.tipoColaborador : null,
      fechaContratacion: formData.rol === 'administrativo' && formData.fechaContratacion
        ? formData.fechaContratacion : null,
      salario: formData.rol === 'administrativo' && formData.salario
        ? parseFloat(formData.salario) : null,
    };

    try {
      if (isEditing) {
        await updatePersona(persona.id || persona.Id, payload);
        toastSuccess({ text: 'Datos actualizados exitosamente.' });
        onClose(true);
      } else {
        await createPersona(payload);
        toastSuccess({ text: 'Persona registrada exitosamente.' });
        setFormData({
          nombre: '', apellido: '', dni: '', telefono: '', direccion: '', email: '', rol: '',
          colegio: '', gradoCurso: '', nivelEducativo: '',
          titulo: '', otroTitulo: '', fechaIngreso: '',
          tipoColaborador: '', fechaContratacion: '', salario: '',
        });
        setMaterias([emptyMateria()]);
        setTouched({});
        onClose(true);
      }
    } catch (error) {
      const msg = error.response?.data?.errores?.[0]?.mensaje
        || error.response?.data?.mensaje
        || 'Ocurrió un error al procesar los datos.';
      toastError({ title: isEditing ? 'Error al Guardar' : 'Error en el Alta', text: msg });
    }
  };

  // ── render ──────────────────────────────────────────────────────────────────

  return (
    <div className="personasWrap">
      <div className="personasPanel personaFormPanel">
        <div className="panelHeader">
          <div>
            <div className="panelTitle">{isEditing ? 'Editar Persona' : 'Alta de Persona'}</div>
            <div className="panelSub">
              {isEditing
                ? `Modificando los datos de ${persona.nombre} ${persona.apellido}`
                : 'Completá los campos obligatorios para registrar una nueva persona.'}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="personaForm" noValidate>

          {/* ── DATOS BÁSICOS (siempre visibles) ── */}
          <h3 className="sectionTitle">Datos Básicos</h3>
          <div className="formGrid">
            <div className="formGroup">
              <label>Nombre *</label>
              <input name="nombre" value={formData.nombre} onChange={handleChange} onBlur={handleBlur} className={getInputClass('nombre')} />
              {renderError('nombre')}
            </div>
            <div className="formGroup">
              <label>Apellido *</label>
              <input name="apellido" value={formData.apellido} onChange={handleChange} onBlur={handleBlur} className={getInputClass('apellido')} />
              {renderError('apellido')}
            </div>
            <div className="formGroup">
              <label>DNI *</label>
              <input name="dni" inputMode="numeric" value={formData.dni} onChange={handleChange} onBlur={handleBlur} className={getInputClass('dni')} />
              {renderError('dni')}
            </div>
            <div className="formGroup">
              <label>Teléfono *</label>
              <input name="telefono" type="tel" value={formData.telefono} onChange={handleChange} onBlur={handleBlur} className={getInputClass('telefono')} />
              {renderError('telefono')}
            </div>
            <div className="formGroup full-width">
              <label>Dirección *</label>
              <input name="direccion" value={formData.direccion} onChange={handleChange} onBlur={handleBlur} className={getInputClass('direccion')} />
              {renderError('direccion')}
            </div>
            <div className="formGroup full-width">
              <label>Correo Electrónico *</label>
              <input name="email" type="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} className={getInputClass('email')} placeholder="ejemplo@correo.com" />
              {renderError('email')}
            </div>
            <div className="formGroup full-width">
              <label>Rol Asignado *</label>
              <select name="rol" value={formData.rol} onChange={handleChange} onBlur={handleBlur} className={getSelectClass('rol')} disabled={isEditing}>
                <option value="" disabled>Seleccioná un rol…</option>
                <option value="super_admin">Super Administrador</option>
                <option value="alumno">Alumno</option>
                <option value="profesor">Profesor</option>
                <option value="administrativo">Administrativo</option>
              </select>
              {renderError('rol')}
            </div>
          </div>

          {/* ── ALUMNO ── */}
          {formData.rol === 'alumno' && (
            <>
              <h3 className="sectionTitle">Datos Académicos</h3>
              <div className="formGrid">
                <div className="formGroup full-width">
                  <label>Colegio</label>
                  <input name="colegio" value={formData.colegio} onChange={handleChange} onBlur={handleBlur} className={getInputClass('colegio')} />
                </div>
                <div className="formGroup">
                  <label>Grado / Curso</label>
                  <input name="gradoCurso" value={formData.gradoCurso} onChange={handleChange} onBlur={handleBlur} className={getInputClass('gradoCurso')} />
                </div>
                <div className="formGroup">
                  <label>Nivel Educativo</label>
                  <select name="nivelEducativo" value={formData.nivelEducativo} onChange={handleChange} onBlur={handleBlur} className={getSelectClass('nivelEducativo')}>
                    <option value="">Seleccionar…</option>
                    <option value="primario">Primario</option>
                    <option value="secundario">Secundario</option>
                    <option value="terciario">Terciario</option>
                    <option value="universitario">Universitario</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* ── PROFESOR ── */}
          {formData.rol === 'profesor' && (
            <>
              <h3 className="sectionTitle">Datos Profesionales</h3>
              <div className="formGrid">
                <div className="formGroup">
                  <label>Título</label>
                  <select name="titulo" value={formData.titulo} onChange={handleChange} onBlur={handleBlur} className={getSelectClass('titulo')}>
                    <option value="">Seleccionar…</option>
                    <option value="profesorado">Profesorado</option>
                    <option value="licenciatura">Licenciatura</option>
                    <option value="tecnicatura">Tecnicatura</option>
                    <option value="doctorado">Doctorado</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                {formData.titulo === 'otro' && (
                  <div className="formGroup">
                    <label>Especificar Título *</label>
                    <input name="otroTitulo" value={formData.otroTitulo} onChange={handleChange} onBlur={handleBlur} className={getInputClass('otroTitulo')} placeholder="Ej: Maestro de Música" />
                    {renderError('otroTitulo')}
                  </div>
                )}
                <div className="formGroup">
                  <label>Fecha de Ingreso</label>
                  <input type="date" name="fechaIngreso" value={formData.fechaIngreso} onChange={handleChange} onBlur={handleBlur} className={getInputClass('fechaIngreso')} />
                </div>
              </div>

              {/* ── GRILLA DE MATERIAS ── */}
              <div className="materiasSection">
                <div className="materiasSectionHeader">
                  <h3 className="sectionTitle" style={{ margin: 0, borderBottom: 'none' }}>
                    Materias Asignadas
                  </h3>
                  <span className="materiasSectionHint">Valor/hora, cantidad de alumnos y horas por materia</span>
                </div>

                {loadingMaterias ? (
                  <div className="materiasLoading">Cargando materias…</div>
                ) : (
                  <div className="materiasTableWrap">
                    <table className="materiasTable">
                      <thead>
                        <tr>
                          <th>Materia</th>
                          <th>Valor / hora ($)</th>
                          <th>Cant. alumnos</th>
                          <th>Cant. horas</th>
                          <th className="col-remove"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {materias.map((row, i) => (
                          <tr key={row._key}>
                            <td>
                              <select
                                className="select-field select-materia"
                                value={row.materiaId}
                                onChange={e => handleMateriaChange(i, 'materiaId', e.target.value)}
                              >
                                <option value="">Seleccionar…</option>
                                {materiasDisponibles.map(m => (
                                  <option key={m.id} value={String(m.id)}>
                                    {m.nombre}{m.area ? ` — ${m.area}` : ''}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <input
                                type="number" min="0" step="0.01"
                                className="input-field input-materia"
                                value={row.valorHora}
                                placeholder="0.00"
                                onChange={e => handleMateriaChange(i, 'valorHora', e.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                type="number" min="1" step="1"
                                className="input-field input-materia"
                                value={row.cantAlumnos}
                                placeholder="0"
                                onChange={e => handleMateriaChange(i, 'cantAlumnos', e.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                type="number" min="0" step="0.5"
                                className="input-field input-materia"
                                value={row.cantHoras}
                                placeholder="0"
                                onChange={e => handleMateriaChange(i, 'cantHoras', e.target.value)}
                              />
                            </td>
                            <td className="col-remove">
                              <button
                                type="button"
                                className="btn-remove-materia"
                                onClick={() => removeMateria(i)}
                                title="Quitar materia"
                                aria-label="Quitar materia"
                              >
                                ×
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {materiasError && <div className="emsg" style={{ marginTop: 6 }}>{materiasError}</div>}

                <button type="button" className="btn-add-materia" onClick={addMateria}>
                  + Agregar materia
                </button>
              </div>
            </>
          )}

          {/* ── ADMINISTRATIVO ── */}
          {formData.rol === 'administrativo' && (
            <>
              <h3 className="sectionTitle">Datos Laborales</h3>
              <div className="formGrid">
                <div className="formGroup full-width">
                  <label>Tipo de Administrativo *</label>
                  <input name="tipoColaborador" value={formData.tipoColaborador} onChange={handleChange} onBlur={handleBlur} className={getInputClass('tipoColaborador')} placeholder="Ej: Secretaría, Mantenimiento" />
                  {renderError('tipoColaborador')}
                </div>
                <div className="formGroup">
                  <label>
                    Fecha Contratación
                    <span className="labelHint">(Mín: 01/01/2025)</span>
                  </label>
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
            <button type="submit" className="btn primary">
              {isEditing ? 'Guardar Cambios' : 'Registrar Persona'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
