import { useState, useMemo } from 'react'
import { TrendingUp, Wallet, Scissors, Package, Trash2, HandCoins, X } from 'lucide-react'
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

const PRESETS = [['hoy', 'Hoy'], ['semana', 'Esta semana'], ['mes', 'Este mes'], ['trimestre', 'Últimos 90 días']]

const TIPOS = [
  { id: 'ventas',     label: 'Ventas',          desc: 'Por día y por sucursal',       icon: TrendingUp, Reporte: ReporteVentas,     conFechas: true },
  { id: 'pagos',      label: 'Métodos de pago', desc: 'Efectivo, tarjeta y transfer.', icon: Wallet,     Reporte: ReportePagos,      conFechas: true },
  { id: 'cortes',     label: 'Cortes de caja',  desc: 'Esperado, contado, diferencia', icon: Scissors,   Reporte: ReporteCortes,     conFechas: true },
  { id: 'inventario', label: 'Inventario',      desc: 'Existencias contra el mínimo', icon: Package,    Reporte: ReporteInventario, conFechas: false },
  { id: 'mermas',     label: 'Mermas',          desc: 'Producto perdido o dañado',    icon: Trash2,     Reporte: ReporteMermas,     conFechas: true },
  { id: 'credito',    label: 'Crédito almacén', desc: 'Saldo de cada sucursal',       icon: HandCoins,  Reporte: ReporteCredito,    conFechas: false },
]

export default function Reportes() {
  const { sucursales, nombreCorto, nombreSucursal } = useSucursales()

  const periodo = usePeriodo('semana')
  const { dateFrom, dateTo, desde, hasta } = periodo
  const [groupBy,   setGroupBy]   = useState('Día')
  const [active,    setActive]    = useState('ventas')
  const [sucursalId, setSucursalId] = useState('')

  const tipo = TIPOS.find(t => t.id === active)
  const filtro = useMemo(
    () => ({ desde, hasta, sucursalId: sucursalId || undefined, primerDia: dateFrom, ultimoDia: dateTo }),
    [desde, hasta, sucursalId, dateFrom, dateTo],
  )
  const conFiltros = periodo.preset !== 'semana' || sucursalId !== ''

  return (
    <div className="space-y-6">

      <PageHeader breadcrumb="Reportes" title="Reportes y Analítica"
        subtitle={`${tipo.label}${tipo.conFechas ? ` · ${rangoCorto(dateFrom, dateTo)}` : ' · al día de hoy'}`} />

      {/* Report type selector */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {TIPOS.map((t, i) => {
          const isAct = active === t.id
          return (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className="p-4 rounded-2xl border text-left transition-all animate-fade-in-up flex flex-col items-start"
              style={{ animationDelay: `${Math.min(i * 55, 200)}ms`, ...(isAct
                ? { background: '#FFF7ED', border: '1px solid #F97316', boxShadow: '0 2px 12px rgba(249,115,22,.15)', color: '#C2410C' }
                : { background: '#fff', border: '1px solid #FDE8D0', boxShadow: '0 1px 3px rgba(38,52,66,.06)' }
              ) }}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
                style={{ background: isAct ? 'rgba(249,115,22,.15)' : '#FFF7ED' }}>
                <t.icon className="w-4 h-4" style={{ color: '#C2410C' }} />
              </div>
              <p className="text-xs font-bold leading-tight" style={{ color: isAct ? '#C2410C' : '#263442' }}>{t.label}</p>
              <p className="text-[10px] mt-1 leading-tight" style={{ color: '#627080' }}>{t.desc}</p>
            </button>
          )
        })}
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

      <tipo.Reporte key={tipo.id} filtro={filtro} groupBy={groupBy} nombreCorto={nombreCorto} nombreSucursal={nombreSucursal} />
    </div>
  )
}
