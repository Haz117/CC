import { useMemo } from 'react'
import { TrendingUp, Wallet, Scissors, Package, Trash2, HandCoins, X, Printer } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import SelectorSucursal from '../components/SelectorSucursal'
import FiltroPeriodo from '../components/FiltroPeriodo'
import Segmentado from '../components/Segmentado'
import { usePeriodo } from '../hooks/usePeriodo'
import { useSucursales } from '../hooks/useSucursales'
import { rangoCorto } from '../utils/fmt'
import ReporteVentas from './reportes/ReporteVentas'
import ReportePagos from './reportes/ReportePagos'
import ReporteCortes from './reportes/ReporteCortes'
import ReporteInventario from './reportes/ReporteInventario'
import ReporteMermas from './reportes/ReporteMermas'
import ReporteCredito from './reportes/ReporteCredito'
import { useEstadoSesion } from '../hooks/useEstadoSesion'

const PRESETS = [['hoy', 'Hoy'], ['semana', 'Esta semana'], ['mes', 'Este mes'], ['trimestre', 'Últimos 90 días']]

const TIPOS = [
  { id: 'ventas',     label: 'Ventas',          desc: 'Por día y por sucursal',       icon: TrendingUp, Reporte: ReporteVentas,     conFechas: true },
  { id: 'pagos',      label: 'Métodos de pago', desc: 'Efectivo, tarjeta y transferencia', icon: Wallet,     Reporte: ReportePagos,      conFechas: true },
  { id: 'cortes',     label: 'Cortes de caja',  desc: 'Esperado, contado, diferencia', icon: Scissors,   Reporte: ReporteCortes,     conFechas: true },
  { id: 'inventario', label: 'Inventario',      desc: 'Existencias contra el mínimo', icon: Package,    Reporte: ReporteInventario, conFechas: false },
  { id: 'mermas',     label: 'Mermas',          desc: 'Producto perdido o dañado',    icon: Trash2,     Reporte: ReporteMermas,     conFechas: true },
  { id: 'credito',    label: 'Crédito almacén', desc: 'Saldo de cada sucursal',       icon: HandCoins,  Reporte: ReporteCredito,    conFechas: false },
]

export default function Reportes() {
  const { sucursales, nombreCorto, nombreSucursal } = useSucursales()

  const periodo = usePeriodo('semana', 'reportes')
  const { dateFrom, dateTo, desde, hasta } = periodo
  const [groupBy,   setGroupBy]   = useEstadoSesion('reportes:agrupar', 'Día')
  const [active,    setActive]    = useEstadoSesion('reportes:tipo', 'ventas')
  const [sucursalId, setSucursalId] = useEstadoSesion('reportes:sucursal', '')

  const tipo = TIPOS.find(t => t.id === active)
  const filtro = useMemo(
    () => ({ desde, hasta, sucursalId: sucursalId || undefined, primerDia: dateFrom, ultimoDia: dateTo }),
    [desde, hasta, sucursalId, dateFrom, dateTo],
  )
  const conFiltros = periodo.preset !== 'semana' || sucursalId !== ''

  // Flechas izquierda/derecha entre pestañas, como en cualquier lista de pestañas
  const moverPestana = (e) => {
    const paso = { ArrowRight: 1, ArrowLeft: -1 }[e.key]
    if (!paso) return
    e.preventDefault()
    const i = TIPOS.findIndex(t => t.id === active)
    const siguiente = TIPOS[(i + paso + TIPOS.length) % TIPOS.length]
    setActive(siguiente.id)
    document.getElementById(`pestana-${siguiente.id}`)?.focus()
  }

  return (
    <div className="space-y-6">

      <PageHeader title="Reportes"
        subtitle={`${tipo.desc}${tipo.conFechas ? ` · ${rangoCorto(dateFrom, dateTo)}` : ' · al día de hoy'}`}>
        {/* Imprime solo el reporte: el menú, la barra de arriba y este botón no salen en papel */}
        <button type="button" className="btn-secondary no-imprimir" onClick={() => window.print()}>
          <Printer className="w-4 h-4" aria-hidden="true" /> Imprimir
        </button>
      </PageHeader>

      {/* Tipo de reporte: pestañas de texto (con flechas se pasa de una a otra) */}
      <div className="pestanas-reporte" role="tablist" aria-label="Tipo de reporte" onKeyDown={moverPestana}>
        {TIPOS.map(t => (
          <button
            key={t.id}
            id={`pestana-${t.id}`}
            type="button"
            role="tab"
            aria-selected={active === t.id}
            aria-controls="reporte-activo"
            tabIndex={active === t.id ? 0 : -1}
            onClick={() => setActive(t.id)}
            className="pestana-reporte"
          >
            <t.icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="card overflow-hidden mb-6">
        <div className="data-toolbar">
          <div className="data-toolbar-row">
            {tipo.conFechas ? (
              <FiltroPeriodo periodo={periodo} presets={PRESETS} />
            ) : (
              <p className="text-xs font-semibold" style={{ color: '#627080' }}>Este reporte muestra el estado actual: no depende del periodo.</p>
            )}
            <SelectorSucursal value={sucursalId} onChange={setSucursalId} sucursales={sucursales} soloTiendas={active !== 'inventario'} className="ml-auto" />
            {conFiltros && (
              <button
                onClick={() => { periodo.elegirPreset('semana'); setSucursalId('') }}
                style={{ fontSize: '.72rem', fontWeight: 700, color: '#627080', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 8, transition: 'color .15s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#8A4A42'}
                onMouseLeave={e => e.currentTarget.style.color = '#627080'}
              >
                <X size={12} /> Limpiar
              </button>
            )}
          </div>
          {active === 'ventas' && (
            <div className="data-toolbar-footer">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-semibold flex-shrink-0" style={{ color: '#627080' }}>Agrupar por:</span>
                <Segmentado
                  opciones={['Día', 'Semana', 'Mes', 'Sucursal'].map(g => ({ valor: g, texto: g }))}
                  value={groupBy}
                  onChange={setGroupBy}
                  etiqueta="Agrupar por"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div id="reporte-activo" role="tabpanel" aria-labelledby={`pestana-${tipo.id}`}>
        <tipo.Reporte key={tipo.id} filtro={filtro} groupBy={groupBy} nombreCorto={nombreCorto} nombreSucursal={nombreSucursal} />
      </div>
    </div>
  )
}
