import { useState, useEffect } from 'react';
import { toastSuccess, toastError } from '../../../lib/alerts';
import './materiasDashboard.css';

const DEFAULT_SPECIALTIES = [
  'Matemática', 'Álgebra', 'Probabilidad y Estadística', 'Geometría',
  'Historia', 'Geografía', 'Filosofía', 'Lengua', 'Literatura', 'Inglés',
  'Biología', 'Química', 'Física'
];

export function MateriasDashboard() {
  const [specialties, setSpecialties] = useState([]);
  const [newSpecialty, setNewSpecialty] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Cargar especialidades desde localStorage al iniciar
  useEffect(() => {
    const saved = localStorage.getItem('eima_specialties');
    if (saved) {
      try {
        setSpecialties(JSON.parse(saved));
      } catch {
        setSpecialties(DEFAULT_SPECIALTIES);
        localStorage.setItem('eima_specialties', JSON.stringify(DEFAULT_SPECIALTIES));
      }
    } else {
      setSpecialties(DEFAULT_SPECIALTIES);
      localStorage.setItem('eima_specialties', JSON.stringify(DEFAULT_SPECIALTIES));
    }
  }, []);

  // Guardar en localStorage
  const saveSpecialties = (list) => {
    setSpecialties(list);
    localStorage.setItem('eima_specialties', JSON.stringify(list));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    const cleanValue = newSpecialty.trim();
    if (!cleanValue) {
      toastError({ title: 'Campo Vacío', text: 'Por favor, ingrese el nombre de la especialidad.' });
      return;
    }

    // Validación case-insensitive
    const exists = specialties.some(s => s.toLowerCase() === cleanValue.toLowerCase());
    if (exists) {
      toastError({ title: 'Especialidad Existente', text: `La especialidad "${cleanValue}" ya está registrada.` });
      return;
    }

    const updated = [...specialties, cleanValue].sort((a, b) => a.localeCompare(b));
    saveSpecialties(updated);
    setNewSpecialty('');
    toastSuccess({ text: `Especialidad "${cleanValue}" agregada correctamente.` });
  };

  const handleDelete = (specialty) => {
    if (window.confirm(`¿Está seguro de que desea eliminar la especialidad "${specialty}" del catálogo?`)) {
      const updated = specialties.filter(s => s !== specialty);
      saveSpecialties(updated);
      toastSuccess({ text: `Especialidad "${specialty}" eliminada correctamente.` });
    }
  };

  const filteredSpecialties = specialties.filter(s =>
    s.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="materiasWrap animate-fadeIn">
      <div className="materiasPanel">
        <div className="panelHeader">
          <div>
            <div className="panelTitle">Configuración de Especialidades (Materias)</div>
            <div className="panelSub">
              Configure las materias y áreas de especialidad que los profesores pueden impartir en el instituto.
            </div>
          </div>
        </div>

        {/* Sección del Formulario para Agregar */}
        <div className="addSpecialtyCard">
          <h3 className="sectionSubTitleTitle">Agregar Nueva Especialidad</h3>
          <form onSubmit={handleAdd} className="addSpecialtyForm">
            <input
              type="text"
              placeholder="Ej: Programación, Inteligencia Artificial, Robótica..."
              value={newSpecialty}
              onChange={(e) => setNewSpecialty(e.target.value)}
              className="input-field new-specialty-input"
            />
            <button type="submit" className="btn primary">
              Agregar Especialidad
            </button>
          </form>
        </div>

        {/* Buscador e Información */}
        <div className="searchAndMetaRow">
          <input
            type="text"
            placeholder="Buscar especialidad..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field search-specialty-input"
          />
          <div className="metaInfo">
            Total en catálogo: <strong>{specialties.length}</strong>
          </div>
        </div>

        {/* Cuadrícula de Especialidades */}
        <div className="specialtiesContainer">
          {filteredSpecialties.length > 0 ? (
            <div className="specialtiesGrid">
              {filteredSpecialties.map((specialty) => (
                <div key={specialty} className="specialtyCard">
                  <span className="specialtyName">{specialty}</span>
                  <button
                    onClick={() => handleDelete(specialty)}
                    className="btn-icon danger deleteSpecialtyBtn"
                    title={`Eliminar "${specialty}"`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="emptyStateSpecialties">
              {searchQuery ? 'No se encontraron especialidades que coincidan con la búsqueda.' : 'No hay especialidades configuradas en el sistema.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
