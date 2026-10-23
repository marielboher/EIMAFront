import { useEffect, useRef, useState } from 'react'
import {
  getInformeAsignacionesAula,
  mensajeErrorAsignacion,
} from '../../../services/asignacionesAula'
import { toastError } from '../../../lib/alerts'
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

function etiquetaMes(valor) {
  const partes = partesMes(valor)
  if (!partes) return '—'
  const fecha = new Date(partes.anio, partes.mes - 1, 1)
  const texto = fecha.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
  return texto.charAt(0).toUpperCase() + texto.slice(1)
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

export function InformeAsignacionesPage() {
  const [periodo, setPeriodo] = useState(mesActualInput)
  const [informe, setInforme] = useState(null)
  const [loading, setLoading] = useState(true)
  const requestSeq = useRef(0)

  useEffect(() => {
    const partes = partesMes(periodo)
    if (!partes) return undefined

    const ac = new AbortController()
    const seq = ++requestSeq.current

    getInformeAsignacionesAula({ ...partes, signal: ac.signal })
      .then((res) => {
        if (seq === requestSeq.current) setInforme(res)
      })
      .catch((error) => {
        if (error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') return
        if (seq !== requestSeq.current) return
        toastError({
          title: 'Error',
          text: mensajeErrorAsignacion(error, 'No se pudo generar el informe del mes.'),
        })
      })
      .finally(() => {
        if (seq === requestSeq.current) setLoading(false)
      })

    return () => ac.abort()
  }, [periodo])

  const cambiarPeriodo = (valor) => {
    if (!valor || valor === periodo) return
    setLoading(true)
    setPeriodo(valor)
  }

  const tarjetas = informe
    ? [
        {
          clave: 'creadas',
          titulo: 'Creadas',
          valor: numero.format(informe.creadas ?? 0),
          definicion: informe.definiciones?.creadas,
        },
        {
          clave: 'cerradas',
          titulo: 'Cerradas',
          valor: numero.format(informe.cerradas ?? 0),
          definicion: informe.definiciones?.cerradas,
        },
        {
          clave: 'abiertas',
          titulo: 'Abiertas al cierre',
          valor: numero.format(informe.abiertasAlCierre ?? 0),
          definicion: informe.definiciones?.abiertasAlCierre,
        },
        {
          clave: 'sla',
          titulo: 'SLA de cierre',
          valor: informe.slaPorcentaje == null ? '—' : `${numero2.format(informe.slaPorcentaje)} %`,
          detalle: informe.cerradas > 0
            ? `${numero.format(informe.cerradasEnVigencia ?? 0)} de ${numero.format(informe.cerradas)} cerradas dentro de vigencia`
            : 'Sin cierres en el mes',
          definicion: informe.definiciones?.sla,
        },
        {
          clave: 'tme',
          titulo: 'TME de cierre',
          valor: informe.tmeDias == null ? '—' : `${numero1.format(informe.tmeDias)} días`,
          definicion: informe.definiciones?.tme,
        },
      ]
    : []

  return (
    <div className="personasWrap informesWrap">
      <div className="personasPanel">
        <div className="panelHeader informesHeader">
          <div>
            <div className="panelTitle">Indicadores del mes</div>
            <div className="panelSub">
              Asignaciones de aula creadas, cerradas y abiertas al cierre, con SLA y TME
            </div>
          </div>
          <label className="informesMes">
            <span>Mes</span>
            <input
              type="month"
              className="input-field"
              value={periodo}
              onChange={(e) => cambiarPeriodo(e.target.value)}
              aria-label="Mes del informe"
            />
          </label>
        </div>

        <div className="informesMeta" aria-live="polite">
          <span className="informesPeriodo">{etiquetaMes(periodo)}</span>
          {informe ? (
            <span>
              Zona horaria Argentina · Última actualización: {formatearActualizacion(informe.fechaActualizacion)}
            </span>
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
                {tarjeta.detalle ? (
                  <div className="informeCardDetail">{tarjeta.detalle}</div>
                ) : null}
                <p className="informeCardDefinition">{tarjeta.definicion}</p>
              </article>
            ))}
          </div>
        )}

        <p className="informesNota">
          La ocupación media y los percentiles de ocupación (P50 y P90) se muestran en el
          informe de ocupación por grupo (HU30).
        </p>
      </div>
    </div>
  )
}
