import { useState, useEffect, useMemo } from 'react';
import { toastSuccess, toastError } from '../../../lib/alerts';
import { getMaterias, createMateria, updateMateria, toggleMateriaEstado } from '../../../services/materias';
import './materiasDashboard.css';

const AREAS_SUGERIDAS = [
  'Ciencias exactas',
  'Área de Ciencias Sociales',
  'Área de Ciencias Naturales',
];

const emptyForm = () => ({
  nombre: '',
  area: '',
  descripcion: '',
});

export function MateriasDashboard() {
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [soloActivas, setSoloActivas] = useState(false);

  const loadMaterias = async (signal) => {
    setLoading(true);
    try {
      const data = await getMaterias({ signal });
      if (!signal?.aborted) setMaterias(Array.isArray(data) ? data : []);
    } catch {
      if (!signal?.aborted) {
        toastError({ title: 'Error', text: 'No se pudieron cargar las materias desde el servidor.' });
        setMaterias([]);
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    const ac = new AbortController();
    loadMaterias(ac.signal);
    return () => ac.abort();
  }, []);

  const resetForm = () => {
    setForm(emptyForm());
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nombre = form.nombre.trim();
    if (!nombre) {
      toastError({ title: 'Campo vacío', text: 'Ingresá el nombre de la materia.' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        nombre,
        area: form.area.trim() || null,
        descripcion: form.descripcion.trim() || null,
        duracionHoras: 0,
        precioPorClase: 0,
        activa: true,
      };

      if (editingId != null) {
        const actual = materias.find((m) => m.id === editingId);
        payload.activa = actual?.activa ?? true;
        payload.duracionHoras = actual?.duracionHoras ?? 0;
        payload.precioPorClase = actual?.precioPorClase ?? 0;
        await updateMateria(editingId, payload);
        toastSuccess({ text: `Materia "${nombre}" actualizada.` });
      } else {
        await createMateria(payload);
        toastSuccess({ text: `Materia "${nombre}" agregada.` });
      }

      resetForm();
      await loadMaterias();
    } catch (err) {
      const msg = err?.response?.data?.mensaje || 'No se pudo guardar la materia.';
      toastError({ title: 'Error', text: msg });
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (m) => {
    setEditingId(m.id);
    setForm({
      nombre: m.nombre || '',
      area: m.area || '',
      descripcion: m.descripcion || '',
    });
  };

  const handleToggle = async (m) => {
    const accion = m.activa ? 'desactivar' : 'reactivar';
    if (!window.confirm(`¿${accion.charAt(0).toUpperCase() + accion.slice(1)} la materia "${m.nombre}"?`)) {
      return;
    }
    try {
      await toggleMateriaEstado(m.id);
      toastSuccess({ text: `Materia "${m.nombre}" ${m.activa ? 'desactivada' : 'reactivada'}.` });
      await loadMaterias();
    } catch {
      toastError({ title: 'Error', text: 'No se pudo cambiar el estado de la materia.' });
    }
  };

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return materias.filter((m) => {
      if (soloActivas && !m.activa) return false;
      if (!q) return true;
      return (
        (m.nombre || '').toLowerCase().includes(q) ||
        (m.area || '').toLowerCase().includes(q)
      );
    });
  }, [materias, searchQuery, soloActivas]);

  return (
    <div className="materiasWrap animate-fadeIn">
      <div className="materiasPanel">
        <div className="panelHeader">
          <div>
            <div className="panelTitle">Configuración de Materias</div>
            <div className="panelSub">
              Administrá el catálogo de materias del instituto (conectado al backend).
            </div>
          </div>
        </div>

        <div className="addSpecialtyCard">
          <h3 className="sectionSubTitleTitle">
            {editingId != null ? 'Editar materia' : 'Agregar nueva materia'}
          </h3>
          <form onSubmit={handleSubmit} className="addSpecialtyForm materiasFormGrid">
            <input
              type="text"
              placeholder="Nombre (ej: Programación)"
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              className="input-field new-specialty-input"
              disabled={saving}
            />
            <input
              type="text"
              list="areas-materias"
              placeholder="Área (opcional)"
              value={form.area}
              onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}
              className="input-field new-specialty-input"
              disabled={saving}
            />
            <datalist id="areas-materias">
              {AREAS_SUGERIDAS.map((a) => (
                <option key={a} value={a} />
              ))}
            </datalist>
            <input
              type="text"
              placeholder="Descripción (opcional)"
              value={form.descripcion}
              onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
              className="input-field new-specialty-input"
              disabled={saving}
            />
            <div className="materiasFormActions">
              <button type="submit" className="btn primary" disabled={saving}>
                {saving ? 'Guardando…' : editingId != null ? 'Guardar cambios' : 'Agregar materia'}
              </button>
              {editingId != null && (
                <button type="button" className="btn" onClick={resetForm} disabled={saving}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="searchAndMetaRow">
          <input
            type="text"
            placeholder="Buscar por nombre o área…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field search-specialty-input"
          />
          <label className="materiasFilterActivas">
            <input
              type="checkbox"
              checked={soloActivas}
              onChange={(e) => setSoloActivas(e.target.checked)}
            />
            Solo activas
          </label>
          <div className="metaInfo">
            Total: <strong>{filtered.length}</strong>
            {!soloActivas && materias.some((m) => !m.activa) ? (
              <span className="metaMuted"> ({materias.filter((m) => !m.activa).length} inactivas)</span>
            ) : null}
          </div>
        </div>

        <div className="specialtiesContainer">
          {loading ? (
            <div className="emptyStateSpecialties">Cargando materias…</div>
          ) : filtered.length > 0 ? (
            <div className="specialtiesGrid">
              {filtered.map((m) => (
                <div key={m.id} className={`specialtyCard${m.activa ? '' : ' specialtyInactive'}`}>
                  <div className="specialtyInfo">
                    <span className="specialtyName">{m.nombre}</span>
                    {m.area ? <span className="specialtyArea">{m.area}</span> : null}
                  </div>
                  <div className="specialtyActions">
                    <button
                      type="button"
                      onClick={() => startEdit(m)}
                      className="btn-icon editSpecialtyBtn"
                      title={`Editar "${m.nombre}"`}
                    >
                      ✎
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggle(m)}
                      className={`btn-icon ${m.activa ? 'danger' : 'primary'} deleteSpecialtyBtn`}
                      title={m.activa ? `Desactivar "${m.nombre}"` : `Reactivar "${m.nombre}"`}
                    >
                      {m.activa ? '×' : '↺'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="emptyStateSpecialties">
              {searchQuery || soloActivas
                ? 'No se encontraron materias que coincidan con el filtro.'
                : 'No hay materias configuradas en el sistema.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
