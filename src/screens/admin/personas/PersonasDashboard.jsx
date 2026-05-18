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

  // Estados de paginación del servidor (HU15)
  const [paginaActual, setPaginaActual] = useState(1);
  const [paginasTotales, setPaginasTotales] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);

  // Carga de datos unificada con filtros de servidor
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData({ pagina: 1, buscar: search, rol: filterRole, estado: filterState });
    }, 350);

    return () => clearTimeout(delayDebounceFn);
  }, [search, filterRole, filterState]);

  const fetchData = async (options = {}) => {
    setLoading(true);
    try {
      const rol = options.rol !== undefined ? options.rol : filterRole;
      const estado = options.estado !== undefined ? options.estado : filterState;
      const buscar = options.buscar !== undefined ? options.buscar : search;
      const pagina = options.pagina !== undefined ? options.pagina : paginaActual;
      const limite = 20;

      const res = await getPersonas({ rol, estado, buscar, pagina, limite });
      
      setPersonas(res.datos || []);
      setPaginaActual(res.paginaActual || 1);
      setPaginasTotales(res.paginasTotales || 1);
      setTotalRegistros(res.totalRegistros || 0);
    } catch (error) {
      console.error("Error al cargar personas:", error);
      setPersonas([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevPage = () => {
    if (paginaActual > 1) {
      fetchData({ pagina: paginaActual - 1 });
    }
  };

  const handleNextPage = () => {
    if (paginaActual < paginasTotales) {
      fetchData({ pagina: paginaActual + 1 });
    }
  };

  const handleEdit = (persona) => {
    setEditingPersona(persona);
    setShowForm(true);
  };

  const handleToggleState = async (personaId) => {
    try {
      const result = await togglePersonaEstado(personaId);
      setPersonas(prev => prev.map(p => 
        (p.id === personaId || p.Id === personaId) ? { ...p, activo: result.activo } : p
      ));
    } catch (error) {
      alert("No se pudo cambiar el estado de la persona.");
    }
  };

  if (showForm) {
    return (
      <PersonaForm 
        persona={editingPersona} 
        onClose={(huboCambios) => {
          setShowForm(false);
          setEditingPersona(null);
          if (huboCambios === true) {
            fetchData({ pagina: paginaActual });
          }
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
                {personas.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="emptyState">No se encontraron resultados.</td>
                  </tr>
                ) : (
                  personas.map(p => {
                    const nombre = `${p.nombre || p.Nombre || ''} ${p.apellido || p.Apellido || ''}`;
                    const rol = p.rol?.nombre || p.rol?.Nombre || '—';
                    const estado = p.activo ? 'activo' : 'inactivo';
                    
                    return (
                      <tr key={p.id || p.Id} className={!p.activo ? 'row-inactive' : ''}>
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
                            onClick={() => handleToggleState(p.id || p.Id)}
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
        
        {/* Paginación en servidor (HU15) */}
        <div className="pagination">
          <span>Mostrando {personas.length} de {totalRegistros} registros (Pág. {paginaActual} de {paginasTotales})</span>
          <div className="pagination-controls">
            <button 
              className="btn outline small" 
              disabled={paginaActual <= 1} 
              onClick={handlePrevPage}
            >
              Anterior
            </button>
            <button 
              className="btn outline small" 
              disabled={paginaActual >= paginasTotales} 
              onClick={handleNextPage}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
