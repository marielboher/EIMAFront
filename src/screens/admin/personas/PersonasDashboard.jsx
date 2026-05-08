import { useEffect, useState } from 'react';
import { PersonaForm } from './PersonaForm';
import { getPersonas, togglePersonaEstado } from '../../../services/personas';
import './personas.css';

export function PersonasDashboard() {
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('todos');
  const [filterState, setFilterState] = useState('activo');
  const [showForm, setShowForm] = useState(false);
  const [editingPersona, setEditingPersona] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getPersonas();
      setPersonas(data);
    } catch (error) {
      console.error("Error al cargar personas:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrado de la lista
  const filteredPersonas = personas.filter(p => {
    const nombreCompleto = `${p.nombre || p.Nombre || ''} ${p.apellido || p.Apellido || ''}`.toLowerCase();
    const dni = (p.dni || p.Dni || '').toString();
    const matchesSearch = nombreCompleto.includes(search.toLowerCase()) || dni.includes(search);
    
    const rolPersona = (p.rol?.nombre || p.rol?.Nombre || '').toLowerCase();
    const matchesRole = filterRole === 'todos' || rolPersona === filterRole;
    
    const estadoActual = p.activo ? 'activo' : 'inactivo';
    const matchesState = filterState === 'todos' || estadoActual === filterState;
    
    return matchesSearch && matchesRole && matchesState;
  });

  const handleEdit = (persona) => {
    setEditingPersona(persona);
    setShowForm(true);
  };

  const handleToggleState = async (personaId) => {
    try {
      const result = await togglePersonaEstado(personaId);
      setPersonas(prev => prev.map(p => 
        p.id === personaId ? { ...p, activo: result.activo } : p
      ));
    } catch (error) {
      alert("No se pudo cambiar el estado de la persona.");
    }
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
          {loading ? (
            <div className="emptyState">Cargando personas...</div>
          ) : (
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
                  filteredPersonas.map(p => {
                    const nombre = `${p.nombre || p.Nombre || ''} ${p.apellido || p.Apellido || ''}`;
                    const rol = p.rol?.nombre || p.rol?.Nombre || '—';
                    const estado = p.activo ? 'activo' : 'inactivo';
                    
                    return (
                      <tr key={p.id} className={!p.activo ? 'row-inactive' : ''}>
                        <td className="fw-600">{nombre}</td>
                        <td>{p.dni || p.Dni}</td>
                        <td className="capitalize">{rol}</td>
                        <td>
                          <span className={`badge ${estado}`}>
                            {estado}
                          </span>
                        </td>
                        <td className="actions-col">
                          <button className="btn-icon" onClick={() => handleEdit(p)} title="Editar Ficha">
                            ✎
                          </button>
                          <button 
                            className={`btn-icon ${p.activo ? 'danger' : 'success'}`} 
                            onClick={() => handleToggleState(p.id)}
                            title={p.activo ? 'Dar de baja' : 'Reactivar'}
                          >
                            {p.activo ? '🚫' : '✅'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
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
