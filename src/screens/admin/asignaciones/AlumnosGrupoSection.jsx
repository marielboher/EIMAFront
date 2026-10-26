import { useEffect, useState } from 'react'
import {
  darBajaAlumnoGrupo,
  getAlumnosGrupo,
  getAsignacionAulaById,
  getCandidatosGrupo,
  mensajeErrorAsignacion,
  vincularAlumnoGrupo,
} from '../../../services/asignacionesAula'
import { confirmDialog, toastError, toastSuccess } from '../../../lib/alerts'
import { cuposDe, formatFechaHora } from './asignacionHelpers'

export function AlumnosGrupoSection({ asignacion, onCupoActualizado }) {
  const [listado, setListado] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [buscar, setBuscar] = useState('')
  const [candidatos, setCandidatos] = useState([])
  const [buscando, setBuscando] = useState(false)
  const [ocupado, setOcupado] = useState(false)

  const cupo = cuposDe(listado ?? asignacion)
  const admiteAltas = Boolean(listado?.admiteAltas)
  const motivo = listado?.motivoNoAdmiteAltas || (cupo.completo ? 'Cupo completo.' : null)

  useEffect(() => {
    const ac = new AbortController()
    setCargando(true)
    getAlumnosGrupo(asignacion.id, { signal: ac.signal })
      .then((datos) => setListado(datos))
      .catch((error) => {
        if (error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') return
        toastError({
          title: 'No se pudieron cargar los alumnos',
          text: mensajeErrorAsignacion(error, 'Intentá nuevamente.'),
        })
      })
      .finally(() => {
        if (!ac.signal.aborted) setCargando(false)
      })
    return () => ac.abort()
  }, [asignacion.id])

  useEffect(() => {
    if (!admiteAltas) {
      setCandidatos([])
      return undefined
    }

    const ac = new AbortController()
    const timer = setTimeout(() => {
      setBuscando(true)
      getCandidatosGrupo(asignacion.id, buscar.trim(), { signal: ac.signal })
        .then((datos) => setCandidatos(Array.isArray(datos) ? datos : []))
        .catch((error) => {
          if (error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') return
          toastError({
            title: 'No se pudieron buscar candidatos',
            text: mensajeErrorAsignacion(error, 'Intentá nuevamente.'),
          })
        })
        .finally(() => {
          if (!ac.signal.aborted) setBuscando(false)
        })
    }, 250)

    return () => {
      clearTimeout(timer)
      ac.abort()
    }
  }, [admiteAltas, asignacion.id, buscar])

  const refrescarDesdeServidor = async () => {
    const [lista, grupo] = await Promise.all([
      getAlumnosGrupo(asignacion.id).catch(() => null),
      getAsignacionAulaById(asignacion.id).catch(() => null),
    ])
    if (lista) setListado(lista)
    if (grupo) onCupoActualizado?.(grupo)
  }

  const vincular = async (candidato) => {
    const confirmado = await confirmDialog({
      title: 'Vincular alumno',
      text: `Se reservará un cupo para ${candidato.nombreCompleto} (DNI ${candidato.dni}).`,
      confirmText: 'Vincular',
      cancelText: 'Cancelar',
    })
    if (!confirmado) return

    setOcupado(true)
    try {
      const respuesta = await vincularAlumnoGrupo(asignacion.id, candidato.personaId)
      if (respuesta.grupo) onCupoActualizado?.(respuesta.grupo)
      const lista = await getAlumnosGrupo(asignacion.id)
      setListado(lista)
      setBuscar('')
      toastSuccess({ text: 'Alumno vinculado. El cupo se actualizó.' })
    } catch (error) {
      toastError({
        title: 'No se pudo vincular',
        text: mensajeErrorAsignacion(error, 'El servidor rechazó el alta.'),
      })
      await refrescarDesdeServidor()
    } finally {
      setOcupado(false)
    }
  }

  const darBaja = async (alumno) => {
    const confirmado = await confirmDialog({
      title: 'Dar de baja del grupo',
      text: `${alumno.nombreCompleto} dejará de ocupar cupo. El vínculo queda en el histórico.`,
      confirmText: 'Dar de baja',
      cancelText: 'Cancelar',
      danger: true,
    })
    if (!confirmado) return

    setOcupado(true)
    try {
      const respuesta = await darBajaAlumnoGrupo(asignacion.id, alumno.personaId)
      if (respuesta.grupo) onCupoActualizado?.(respuesta.grupo)
      const lista = await getAlumnosGrupo(asignacion.id)
      setListado(lista)
      toastSuccess({ text: 'Baja registrada. El cupo quedó liberado.' })
    } catch (error) {
      toastError({
        title: 'No se pudo dar de baja',
        text: mensajeErrorAsignacion(error, 'Intentá nuevamente.'),
      })
      await refrescarDesdeServidor()
    } finally {
      setOcupado(false)
    }
  }

  return (
    <div className="detail-section alumnosGrupo">
      <h3 className="detail-section-title">Alumnos inscriptos</h3>
      <div className="cupoResumen" aria-live="polite">
        <span><strong>{cupo.ocupados}</strong> ocupados</span>
        <span><strong>{cupo.habilitado}</strong> habilitado</span>
        <span><strong>{cupo.disponibles}</strong> disponibles</span>
      </div>

      {cargando && !listado ? (
        <p className="asigHint">Cargando alumnos…</p>
      ) : (
        <div className="alumnosTablaWrap">
          <table className="alumnosTabla">
            <thead>
              <tr>
                <th>Alumno</th>
                <th>DNI</th>
                <th>Fecha de alta</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {(listado?.alumnos ?? []).length === 0 ? (
                <tr>
                  <td colSpan="4" className="asigHint">Todavía no hay alumnos vinculados.</td>
                </tr>
              ) : (
                listado.alumnos.map((alumno) => (
                  <tr key={alumno.vinculoId}>
                    <td>{alumno.nombreCompleto}</td>
                    <td>{alumno.dni}</td>
                    <td>{formatFechaHora(alumno.fechaAsignacion)}</td>
                    <td>
                      <button
                        type="button"
                        className="btn outline small"
                        disabled={ocupado}
                        onClick={() => darBaja(alumno)}
                      >
                        Baja
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {admiteAltas ? (
        <div className="candidatosBox">
          <label htmlFor="buscar-candidato">Agregar alumno</label>
          <input
            id="buscar-candidato"
            className="input-field"
            value={buscar}
            placeholder="Buscar por DNI, nombre o apellido"
            onChange={(evento) => setBuscar(evento.target.value)}
            disabled={ocupado}
          />
          <ul className="candidatosLista">
            {buscando ? (
              <li className="asigHint">Buscando candidatos…</li>
            ) : candidatos.length === 0 ? (
              <li className="asigHint">No hay candidatos con inscripción activa para mostrar.</li>
            ) : (
              candidatos.map((candidato) => (
                <li key={candidato.personaId}>
                  <span>{candidato.nombreCompleto} · DNI {candidato.dni}</span>
                  <button
                    type="button"
                    className="btn small"
                    disabled={ocupado}
                    onClick={() => vincular(candidato)}
                  >
                    Agregar
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}

      {listado && !admiteAltas ? (
        <p className="cupoBloqueo" role="status">{motivo || 'Cupo completo.'}</p>
      ) : null}
    </div>
  )
}
