import { useState } from 'react';
import { PersonaForm } from './PersonaForm';
import './personas.css';

// Datos de prueba mockeados
const mockPersonas = [
  { id: 1, nombre: 'Juan', apellido: 'Pérez', dni: '12345678', rol: 'alumno', estado: 'activo' },
  { id: 2, nombre: 'María', apellido: 'Gómez', dni: '87654321', rol: 'docente', estado: 'activo' },
  { id: 3, nombre: 'Carlos', apellido: 'López', dni: '11223344', rol: 'colaborador', estado: 'inactivo' }
];

export function PersonasDashboard() {
  const [personas, setPersonas] = useState(mockPersonas);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('todos');
  const [filterState, setFilterState] = useState('activo');
  const [showForm, setShowForm] = useState(false);
  const [editingPersona, setEditingPersona] = useState(null);

  // Filtrado de la lista
  const filteredPersonas = personas.filter(p => {
    const matchesSearch = `${p.nombre} ${p.apellido} ${p.dni}`.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === 'todos' || p.rol === filterRole;
    const matchesState = filterState === 'todos' || p.estado === filterState;
    return matchesSearch && matchesRole && matchesState;
  });

  const handleEdit = (persona) => {
    setEditingPersona(persona);
    setShowForm(true);
  };

  const handleToggleState = (personaId, currentState) => {
    // Simulación de Baja Lógica (o reactivación)
    setPersonas(prev => prev.map(p => 
      p.id === personaId ? { ...p, estado: currentState === 'activo' ? 'inactivo' : 'activo' } : p
    ));
  };

  if (showForm) {
    return (
      <PersonaForm 
        persona={editingPersona} 
        onClose={() => {
          setShowForm(false);
          setEditingPersona(null);
        }} 
      />
    );
  }

  return (
    <div className="personasWrap">
      <div className="personasPanel" style={{ width: '100%', maxWidth: '800px' }}>
        <div className="panelHeader">
          <div>
            <div className="panelTitle">Directorio de Personas</div>
            <div className="panelSub">Gestión completa de usuarios (Alta, Baja, Modificación)</div>
          </div>
          <button className="btn primary" onClick={() => setShowForm(true)}>+ Nueva Persona</button>
        </div>

        <div className="filtersRow">
          <input 
            className="search input-field" 
            placeholder="Buscar por nombre, apellido o DNI..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="select-field" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="todos">Todos los roles</option>
            <option value="alumno">Alumnos</option>
            <option value="docente">Docentes</option>
            <option value="colaborador">Colaboradores</option>
          </select>
          <select className="select-field" value={filterState} onChange={(e) => setFilterState(e.target.value)}>
            <option value="todos">Todos los estados</option>
            <option value="activo">Solo Activos</option>
            <option value="inactivo">Solo Inactivos</option>
          </select>
        </div>

        <div className="tableContainer">
          <table className="personasTable">
            <thead>
              <tr>
                <th>Nombre Completo</th>
                <th>DNI</th>
                <th>Rol</th>
                <th>Estado</th>
                <th className="actions-col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredPersonas.length === 0 ? (
                <tr>
                  <td colSpan="5" className="emptyState">No se encontraron resultados.</td>
                </tr>
              ) : (
                filteredPersonas.map(p => (
                  <tr key={p.id} className={p.estado === 'inactivo' ? 'row-inactive' : ''}>
                    <td className="fw-600">{p.nombre} {p.apellido}</td>
                    <td>{p.dni}</td>
                    <td className="capitalize">{p.rol}</td>
                    <td>
                      <span className={`badge ${p.estado}`}>
                        {p.estado}
                      </span>
                    </td>
                    <td className="actions-col">
                      <button className="btn-icon" onClick={() => handleEdit(p)} title="Editar Ficha">
                        ✎
                      </button>
                      <button 
                        className={`btn-icon ${p.estado === 'activo' ? 'danger' : 'success'}`} 
                        onClick={() => handleToggleState(p.id, p.estado)}
                        title={p.estado === 'activo' ? 'Dar de baja' : 'Reactivar'}
                      >
                        {p.estado === 'activo' ? '🚫' : '✅'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Paginación simple mockeada */}
        <div className="pagination">
          <span>Mostrando {filteredPersonas.length} registros</span>
          <div className="pagination-controls">
            <button className="btn outline small" disabled>Anterior</button>
            <button className="btn outline small" disabled>Siguiente</button>
          </div>
        </div>
      </div>
    </div>
  );
}
