import { useEffect, useRef, useState } from 'react'
import {
  descargarInformePdf,
  getInformeAsignacionesAula,
  getPreferenciaInforme,
  guardarPreferenciaInforme,
  mensajeErrorAsignacion,
} from '../../../services/asignacionesAula'
import { descargarArchivo } from '../../../lib/download'
import { toastError, toastSuccess } from '../../../lib/alerts'
import '../personas/personas.css'
import './informes.css'

const numero = new Intl.NumberFormat('es-AR')
const numero1 = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 })
const numero2 = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 })

function mesActualInput() {
  const hoy = new Date()
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`
}

function partesMes(valor) {
  const [anio, mes] = String(valor || '').split('-').map(Number)
  if (!anio || !mes) return null
  return { anio, mes }
}

function formatearActualizacion(valor) {
  if (!valor) return '—'
  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) return '—'
  return fecha.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function textoVariacion(variacion, unidad = '') {
  if (!variacion || variacion.absoluta == null) return 'Sin base para comparar'
  const absoluta = Number(variacion.absoluta)
  const signo = absoluta > 0 ? '+' : ''
  const porcentaje = variacion.porcentaje == null
    ? ''
    : ` (${signo}${numero2.format(variacion.porcentaje)} %)`
  return `${signo}${numero2.format(absoluta)}${unidad}${porcentaje}`
}

function claseVariacion(variacion) {
  if (!variacion || variacion.absoluta == null || Number(variacion.absoluta) === 0) return 'variacion variacion--neutra'
  return Number(variacion.absoluta) > 0 ? 'variacion variacion--sube' : 'variacion variacion--baja'
}

function porcentaje(valor) {
  return valor == null ? '—' : `${numero2.format(valor)} %`
}

export function InformeAsignacionesPage() {
  const [listo, setListo] = useState(false)
  const [periodoTipo, setPeriodoTipo] = useState('mes')
  const [periodo, setPeriodo] = useState(mesActualInput)
  const [materiaId, setMateriaId] = useState('')
  const [comparar, setComparar] = useState(false)
  const [informe, setInforme] = useState(null)
  const [materias, setMaterias] = useState([])
  const [loading, setLoading] = useState(true)
  const [descargando, setDescargando] = useState(false)
  const [expandidas, setExpandidas] = useState({})
  const requestSeq = useRef(0)
  const omitirGuardado = useRef(true)

  useEffect(() => {
    const ac = new AbortController()
    getPreferenciaInforme({ signal: ac.signal })
      .then((preferencia) => {
        if (preferencia?.periodoTipo) setPeriodoTipo(preferencia.periodoTipo)
        if (preferencia?.anio && preferencia?.mes) {
          setPeriodo(`${preferencia.anio}-${String(preferencia.mes).padStart(2, '0')}`)
        }
        setMateriaId(preferencia?.materiaId ? String(preferencia.materiaId) : '')
        setComparar(Boolean(preferencia?.comparar))
        setListo(true)
      })
      .catch((error) => {
        if (error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') return
        setListo(true)
      })
    return () => ac.abort()
  }, [])

  useEffect(() => {
    if (!listo) return undefined
    const partes = partesMes(periodo)
    if (!partes) return undefined

    const ac = new AbortController()
    const seq = ++requestSeq.current
    setLoading(true)

    getInformeAsignacionesAula({
      ...partes,
      periodo: periodoTipo,
      materiaId: materiaId || undefined,
      comparar,
      signal: ac.signal,
    })
      .then((res) => {
        if (seq !== requestSeq.current) return
        setInforme(res)
        if (Array.isArray(res?.materiasDisponibles) && res.materiasDisponibles.length > 0) {
          setMaterias(res.materiasDisponibles)
        }
      })
      .catch((error) => {
        if (error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') return
        if (seq !== requestSeq.current) return
        toastError({
          title: 'Error',
          text: mensajeErrorAsignacion(error, 'No se pudo generar el informe.'),
        })
      })
      .finally(() => {
        if (seq === requestSeq.current) setLoading(false)
      })

    if (omitirGuardado.current) {
      omitirGuardado.current = false
    } else {
      guardarPreferenciaInforme({
        periodoTipo,
        anio: partes.anio,
        mes: partes.mes,
        materiaId: materiaId ? Number(materiaId) : null,
        comparar,
      }).catch((error) => {
        toastError({
          title: 'No se pudo recordar el filtro',
          text: mensajeErrorAsignacion(error, 'La selección no quedó guardada.'),
        })
      })
    }

    return () => ac.abort()
  }, [listo, periodo, periodoTipo, materiaId, comparar])

  const descargarPdf = async () => {
    const partes = partesMes(periodo)
    if (!partes) return
    setDescargando(true)
    try {
      const { blob, filename } = await descargarInformePdf({
        ...partes,
        periodo: periodoTipo,
        materiaId: materiaId || undefined,
        comparar,
      })
      descargarArchivo(blob, filename)
      toastSuccess({ text: 'Informe descargado.' })
    } catch (error) {
      toastError({
        title: 'No se pudo descargar el PDF',
        text: mensajeErrorAsignacion(error, 'Intentá nuevamente.'),
      })
    } finally {
      setDescargando(false)
    }
  }

  const tarjetas = informe
    ? [
        {
          clave: 'creadas',
          titulo: 'Creadas',
          valor: numero.format(informe.creadas ?? 0),
          definicion: informe.definiciones?.creadas,
          variacion: informe.variaciones?.creadas,
        },
        {
          clave: 'cerradas',
          titulo: 'Cerradas',
          valor: numero.format(informe.cerradas ?? 0),
          definicion: informe.definiciones?.cerradas,
          variacion: informe.variaciones?.cerradas,
        },
        {
          clave: 'abiertas',
          titulo: 'Abiertas al cierre',
          valor: numero.format(informe.abiertasAlCierre ?? 0),
          definicion: informe.definiciones?.abiertasAlCierre,
          variacion: informe.variaciones?.abiertasAlCierre,
        },
        {
          clave: 'sla',
          titulo: 'SLA de cierre',
          valor: porcentaje(informe.slaPorcentaje),
          detalle: informe.cerradas > 0
            ? `${numero.format(informe.cerradasEnVigencia ?? 0)} de ${numero.format(informe.cerradas)} dentro de vigencia`
            : 'Sin cierres en el periodo',
          definicion: informe.definiciones?.sla,
          variacion: informe.variaciones?.sla,
          unidad: ' pp',
        },
        {
          clave: 'tme',
          titulo: 'TME de cierre',
          valor: informe.tmeDias == null ? '—' : `${numero1.format(informe.tmeDias)} días`,
          definicion: informe.definiciones?.tme,
          variacion: informe.variaciones?.tme,
          unidad: ' días',
        },
      ]
    : []

  const toggleMateria = (id) => {
    setExpandidas((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="personasWrap informesWrap">
      <div className="personasPanel">
        <div className="panelHeader informesHeader">
          <div>
            <div className="panelTitle">Indicadores del periodo</div>
            <div className="panelSub">
              Creadas, cerradas, SLA, TME y ocupación, con comparativo y desglose por materia
            </div>
          </div>
          <button type="button" className="btn outline" onClick={descargarPdf} disabled={descargando || !informe}>
            {descargando ? 'Generando PDF…' : 'Descargar PDF'}
          </button>
        </div>

        <div className="informesFiltros">
          <label>
            <span>Periodo</span>
            <select className="input-field" value={periodoTipo} onChange={(e) => setPeriodoTipo(e.target.value)}>
              <option value="mes">Mes</option>
              <option value="ultimos3meses">Últimos 3 meses</option>
            </select>
          </label>
          <label>
            <span>{periodoTipo === 'ultimos3meses' ? 'Hasta' : 'Mes'}</span>
            <input
              type="month"
              className="input-field"
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              aria-label="Mes ancla del informe"
            />
          </label>
          <label>
            <span>Materia</span>
            <select className="input-field" value={materiaId} onChange={(e) => setMateriaId(e.target.value)}>
              <option value="">Todas</option>
              {materias.map((materia) => (
                <option key={materia.id} value={materia.id}>{materia.nombre}</option>
              ))}
            </select>
          </label>
          <label className="informesComparar">
            <input
              type="checkbox"
              checked={comparar}
              onChange={(e) => setComparar(e.target.checked)}
            />
            <span>Comparar vs. mes anterior</span>
          </label>
        </div>
        {periodoTipo === 'ultimos3meses' ? (
          <p className="informesNota">
            En últimos 3 meses los conteos se suman y el SLA y el TME se recalculan sobre el trimestre.
            {comparar ? ' El comparativo usa el bloque de 3 meses inmediato anterior.' : ''}
          </p>
        ) : null}

        <div className="informesMeta" aria-live="polite">
          <span className="informesPeriodo">{informe?.etiquetaPeriodo || '—'}</span>
          {comparar && informe?.etiquetaPeriodoAnterior ? (
            <span>Contra {informe.etiquetaPeriodoAnterior}</span>
          ) : null}
          {informe ? (
            <span>Última actualización: {formatearActualizacion(informe.fechaActualizacion)}</span>
          ) : (
            <span>{loading ? 'Calculando indicadores…' : 'Sin datos para el período.'}</span>
          )}
        </div>

        {loading && !informe ? (
          <div className="emptyState">Cargando indicadores…</div>
        ) : (
          <div className={`informesGrid${loading ? ' isRefreshing' : ''}`}>
            {tarjetas.map((tarjeta) => (
              <article key={tarjeta.clave} className={`informeCard informeCard--${tarjeta.clave}`}>
                <div className="informeCardTitle">{tarjeta.titulo}</div>
                <div className="informeCardValue">{tarjeta.valor}</div>
                {comparar ? (
                  <div className={claseVariacion(tarjeta.variacion)}>
                    {textoVariacion(tarjeta.variacion, tarjeta.unidad || '')}
                  </div>
                ) : null}
                {tarjeta.detalle ? <div className="informeCardDetail">{tarjeta.detalle}</div> : null}
                <p className="informeCardDefinition">{tarjeta.definicion}</p>
              </article>
            ))}
          </div>
        )}

        {informe ? (
          <>
            <GraficoCreadas informe={informe} comparar={comparar} />
            <section className="informeOcupacion">
              <h3>Ocupación</h3>
              <div className="informeOcupacionGrid">
                <span>Media <strong>{porcentaje(informe.ocupacionMedia)}</strong></span>
                <span>P50 <strong>{porcentaje(informe.ocupacionP50)}</strong></span>
                <span>P90 <strong>{porcentaje(informe.ocupacionP90)}</strong></span>
              </div>
              <p>{informe.definiciones?.ocupacion}</p>
            </section>
            <TablaMaterias
              informe={informe}
              expandidas={expandidas}
              onToggle={toggleMateria}
            />
          </>
        ) : null}
      </div>
    </div>
  )
}

function GraficoCreadas({ informe, comparar }) {
  const series = informe.seriesPorMateria ?? []
  const maximo = Math.max(1, ...series.map((serie) => Math.max(serie.creadas || 0, serie.creadasAnterior || 0)))
  const alto = 180
  const anchoBarra = comparar ? 18 : 28
  const anchoGrupo = comparar ? 64 : 48
  const ancho = Math.max(series.length * anchoGrupo + 36, 280)

  return (
    <section className="informeGrafico" aria-label="Creadas por materia">
      <div className="informeSeccionHead">
        <h3>Creadas por materia</h3>
        <div className="informeLeyenda">
          <span><i className="swatch swatch--actual" /> {informe.etiquetaPeriodo}</span>
          {comparar ? <span><i className="swatch swatch--anterior" /> {informe.etiquetaPeriodoAnterior}</span> : null}
        </div>
      </div>
      {series.length === 0 ? (
        <p className="informesNota">Sin asignaciones creadas en el periodo.</p>
      ) : (
        <div className="informeGraficoScroll">
          <svg viewBox={`0 0 ${ancho} ${alto + 56}`} role="img" width={ancho} height={alto + 56}>
            {series.map((serie, indice) => {
              const x = 28 + indice * anchoGrupo
              const altoActual = (serie.creadas / maximo) * alto
              const altoAnterior = ((serie.creadasAnterior || 0) / maximo) * alto
              return (
                <g key={serie.materiaId}>
                  <rect
                    x={x}
                    y={alto - altoActual}
                    width={anchoBarra}
                    height={Math.max(altoActual, 0)}
                    rx="3"
                    className="barraActual"
                  >
                    <title>{`${serie.materiaNombre}: ${serie.creadas} creadas`}</title>
                  </rect>
                  {comparar ? (
                    <rect
                      x={x + anchoBarra + 4}
                      y={alto - altoAnterior}
                      width={anchoBarra}
                      height={Math.max(altoAnterior, 0)}
                      rx="3"
                      className="barraAnterior"
                    >
                      <title>{`${serie.materiaNombre}: ${serie.creadasAnterior || 0} creadas en el periodo anterior`}</title>
                    </rect>
                  ) : null}
                  <text x={x} y={alto + 16} className="ejeEtiqueta">
                    {serie.materiaNombre.length > 12 ? `${serie.materiaNombre.slice(0, 11)}…` : serie.materiaNombre}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
      )}
    </section>
  )
}

function TablaMaterias({ informe, expandidas, onToggle }) {
  const filas = informe.tabla ?? []
  const total = informe.total

  return (
    <section className="informeTablaWrap">
      <h3>Por materia y docente</h3>
      <div className="informeTablaScroll">
        <table className="informeTabla">
          <thead>
            <tr>
              <th>Materia / docente</th>
              <th>Creadas</th>
              <th>Cerradas</th>
              <th>Ocupación media</th>
              <th>SLA</th>
            </tr>
          </thead>
          <tbody>
            {filas.length === 0 ? (
              <tr>
                <td colSpan="5" className="emptyState">No hay grupos para este recorte.</td>
              </tr>
            ) : filas.map((fila) => {
              const abierta = Boolean(expandidas[fila.id])
              return (
                <FragmentoMateria
                  key={fila.id ?? fila.nombre}
                  fila={fila}
                  abierta={abierta}
                  onToggle={() => onToggle(fila.id)}
                />
              )
            })}
          </tbody>
          {total ? (
            <tfoot>
              <tr className="informeTotal">
                <th>{total.nombre || 'Total'}</th>
                <td>{numero.format(total.creadas ?? 0)}</td>
                <td>{numero.format(total.cerradas ?? 0)}</td>
                <td>{porcentaje(total.ocupacionMedia)}</td>
                <td>{porcentaje(total.slaPorcentaje)}</td>
              </tr>
            </tfoot>
          ) : null}
        </table>
      </div>
    </section>
  )
}

function FragmentoMateria({ fila, abierta, onToggle }) {
  const docentes = fila.docentes ?? []
  return (
    <>
      <tr>
        <th scope="row">
          {docentes.length > 0 ? (
            <button type="button" className="expandirMateria" aria-expanded={abierta} onClick={onToggle}>
              <span aria-hidden="true">{abierta ? '▾' : '▸'}</span>
              {fila.nombre}
            </button>
          ) : fila.nombre}
        </th>
        <td>{numero.format(fila.creadas ?? 0)}</td>
        <td>{numero.format(fila.cerradas ?? 0)}</td>
        <td>{porcentaje(fila.ocupacionMedia)}</td>
        <td>{porcentaje(fila.slaPorcentaje)}</td>
      </tr>
      {abierta ? docentes.map((docente) => (
        <tr key={docente.id} className="informeDocente">
          <th scope="row">{docente.nombre}</th>
          <td>{numero.format(docente.creadas ?? 0)}</td>
          <td>{numero.format(docente.cerradas ?? 0)}</td>
          <td>{porcentaje(docente.ocupacionMedia)}</td>
          <td>{porcentaje(docente.slaPorcentaje)}</td>
        </tr>
      )) : null}
    </>
  )
}
