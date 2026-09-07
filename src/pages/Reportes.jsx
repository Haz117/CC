import { useState, useEffect, useMemo } from 'react'
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts'
import { Download, FileText, Table, TrendingUp, DollarSign, Package, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import toast from '../utils/toast'
import PageHeader from '../components/PageHeader'
import KpiBar from '../components/KpiBar'
import { SkeletonReport } from '../components/Skeleton'
import Pagination from '../components/Pagination'
import {
  ventasDiarias, inventarioChart, inventarioTable,
  distChart, distTable, ganChart, ganTable,
  devDias, devTable, cxcDonut, cxcTable, reportTypes,
} from '../data/reportes'
import { fmt } from '../utils/fmt'
import { useLoadDelay } from '../hooks/useLoadDelay'
import ChartCard from '../components/ChartCard'
import TableCard from '../components/TableCard'

// ── HELPERS ──────────────────────────────────────────────────────────────────
const COLORS = ['#F97316', '#059669', '#d97706', '#7c3aed']

const statusInvSt = {
  Normal:  { color: '#059669', background: 'rgba(5,150,105,.1)'     },
  Bajo:    { color: '#d97706', background: 'rgba(217,119,6,.1)'     },
  Crítico: { color: '#C97A6D', background: 'rgba(201,122,109,.14)'  },
}
const statusDevSt = {
  Procesada: { color: '#059669', background: 'rgba(5,150,105,.1)'    },
  Pendiente: { color: '#d97706', background: 'rgba(217,119,6,.1)'    },
}
const statusCxcSt = {
  'Al corriente': { color: '#059669', background: 'rgba(5,150,105,.1)'    },
  'Por vencer':   { color: '#d97706', background: 'rgba(217,119,6,.1)'    },
  Vencida:        { color: '#C97A6D', background: 'rgba(201,122,109,.14)' },
}

// ── COMPUTED TOTALS ───────────────────────────────────────────────────────────
const totalVentas  = ventasDiarias.reduce((a, d) => a + d.centro + d.norte + d.sur + d.oriente, 0)
const totalInvVal  = inventarioTable.reduce((a, p) => a + p.stock * p.precio, 0)
const totalDVentas = distTable.reduce((a, d) => a + d.ventas, 0)
const totalDCobros = distTable.reduce((a, d) => a + d.cobros, 0)
const totalDSaldo  = distTable.reduce((a, d) => a + d.saldo, 0)
const totalIngresos= ganChart.reduce((a, d) => a + d.ingresos, 0)
const totalCogs    = ganChart.reduce((a, d) => a + d.cogs, 0)
const totalGan     = ganChart.reduce((a, d) => a + d.ganancia, 0)
const totalDevMonto= devTable.reduce((a, d) => a + d.monto, 0)
const totalCxC     = cxcTable.reduce((a, c) => a + c.importe, 0)

const sucKeyMap = { Centro: 'centro', Norte: 'norte', Sur: 'sur', Oriente: 'oriente', Poniente: 'poniente' }

const PAGE_SIZE = 5

export default function Reportes() {
  const loaded = useLoadDelay()
  const [dateFrom,   setDateFrom]   = useState('2026-07-23')
  const [dateTo,     setDateTo]     = useState('2026-07-29')
  const [groupBy,    setGroupBy]    = useState('Sucursal')
  const [active,     setActive]     = useState('ventas')
  const [filterSuc,  setFilterSuc]  = useState('Todas')
  const [devPage,    setDevPage]    = useState(1)
  const [invPage,    setInvPage]    = useState(1)
  const [activePreset, setActivePreset] = useState('semana')

  const selectPreset = (p) => {
    setActivePreset(p)
    const today = new Date('2026-07-31')
    const iso = d => d.toISOString().slice(0, 10)
    if (p === 'hoy') { setDateFrom(iso(today)); setDateTo(iso(today)) }
    else if (p === 'semana') {
      const start = new Date(today); start.setDate(today.getDate() - today.getDay() + 1)
      setDateFrom(iso(start)); setDateTo(iso(today))
    }
    else if (p === 'mes') {
      setDateFrom(`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-01`)
      setDateTo(iso(today))
    }
    else if (p === 'trimestre') {
      const start = new Date(today); start.setDate(today.getDate() - 90)
      setDateFrom(iso(start)); setDateTo(iso(today))
    }
  }

  useEffect(() => { setDevPage(1); setInvPage(1) }, [active, filterSuc])

  const groupedVentasChart = useMemo(() => {
    const sum = (key) => ventasDiarias.reduce((a, d) => a + d[key], 0)
    if (groupBy === 'Sucursal') {
      return [
        { dia: 'Centro',  centro: sum('centro'), norte: 0, sur: 0, oriente: 0 },
        { dia: 'Norte',   centro: 0, norte: sum('norte'), sur: 0, oriente: 0 },
        { dia: 'Sur',     centro: 0, norte: 0, sur: sum('sur'), oriente: 0 },
        { dia: 'Oriente', centro: 0, norte: 0, sur: 0, oriente: sum('oriente') },
      ]
    }
    if (groupBy === 'Semana') {
      const w1 = ventasDiarias.slice(0, 5)
      const w2 = ventasDiarias.slice(5)
      const agg = (days, label) => ({
        dia: label,
        centro:  days.reduce((a, d) => a + d.centro, 0),
        norte:   days.reduce((a, d) => a + d.norte, 0),
        sur:     days.reduce((a, d) => a + d.sur, 0),
        oriente: days.reduce((a, d) => a + d.oriente, 0),
      })
      return [agg(w1, 'Sem. 23–27'), agg(w2, 'Sem. 28–29')]
    }
    if (groupBy === 'Mes') {
      return [{
        dia: 'Julio 2026',
        centro:  sum('centro'),
        norte:   sum('norte'),
        sur:     sum('sur'),
        oriente: sum('oriente'),
      }]
    }
    return ventasDiarias
  }, [groupBy])

  const activeSucKeys = filterSuc === 'Todas'
    ? ['centro', 'norte', 'sur', 'oriente']
    : [sucKeyMap[filterSuc]].filter(Boolean)

  const VENTAS_TABLE_ALL = [{suc:'Centro',ventas:150500,txs:61,dev:900},{suc:'Norte',ventas:94500,txs:38,dev:600},{suc:'Sur',ventas:64700,txs:28,dev:450},{suc:'Oriente',ventas:49000,txs:20,dev:390}]
  const filteredVentasTable = useMemo(() =>
    filterSuc === 'Todas' ? VENTAS_TABLE_ALL : VENTAS_TABLE_ALL.filter(r => r.suc === filterSuc)
  , [filterSuc])

  const filteredGanTable  = useMemo(() => filterSuc === 'Todas' ? ganTable  : ganTable.filter(r => r.suc === filterSuc), [filterSuc])
  const filteredDevTable  = useMemo(() => filterSuc === 'Todas' ? devTable  : devTable.filter(d => d.sucursal === filterSuc), [filterSuc])
  const filteredDistTable = useMemo(() => filterSuc === 'Todas' ? distTable : distTable.filter(d => d.ruta.includes(filterSuc)), [filterSuc])

  const pagedDevTable = useMemo(() => filteredDevTable.slice((devPage - 1) * PAGE_SIZE, devPage * PAGE_SIZE), [filteredDevTable, devPage])
  const pagedInvTable = useMemo(() => inventarioTable.slice((invPage - 1) * PAGE_SIZE, invPage * PAGE_SIZE), [invPage])

  const kpiMap = {
    ventas: [
      { label: 'Ventas del periodo',  value: fmt(totalVentas),           change: '+12% vs ant.',       green: true  },
      { label: 'Ticket promedio',     value: fmt(totalVentas / 147),     change: '+5% vs ant.',        green: true  },
      { label: 'Devoluciones',        value: fmt(2340),                   change: '+8% vs ant.',        green: false },
      { label: 'Ganancia estimada',   value: fmt(totalVentas * 0.35),    change: '+9% vs ant.',        green: true  },
    ],
    inventario: [
      { label: 'Total productos',     value: '8',                         change: 'Sin cambios',        green: true  },
      { label: 'Stock crítico',       value: String(inventarioTable.filter(p => p.status === 'Crítico').length), change: 'Requiere atención', green: false },
      { label: 'Stock bajo',          value: String(inventarioTable.filter(p => p.status === 'Bajo').length),    change: 'Reabastecer pronto', green: false },
      { label: 'Valor del inventario',value: fmt(totalInvVal),            change: '-3% vs semana ant.', green: false },
    ],
    distribuidores: [
      { label: 'Distribuidores activos', value: '5',               change: 'Sin cambios',        green: true  },
      { label: 'Ventas totales',         value: fmt(totalDVentas), change: '+8% vs ant.',        green: true  },
      { label: 'Cobros del periodo',     value: fmt(totalDCobros), change: '+3% vs ant.',        green: true  },
      { label: 'Saldo pendiente',        value: fmt(totalDSaldo),  change: '-10% vs ant.',       green: true  },
    ],
    ganancias: [
      { label: 'Ingresos brutos',     value: fmt(totalIngresos),        change: '+12% vs ant.',  green: true },
      { label: 'COGS (costo mercanc.',value: fmt(totalCogs),            change: '~60% ingresos', green: true },
      { label: 'Gastos operativos',   value: fmt(totalIngresos * 0.1),  change: '~10% ingresos', green: true },
      { label: 'Utilidad neta',       value: fmt(totalGan),             change: '+14% vs ant.',  green: true },
    ],
    devoluciones: [
      { label: 'Total devoluciones',  value: String(devTable.length),   change: '+2 vs ant.',     green: false },
      { label: 'Monto total',         value: fmt(totalDevMonto),        change: '+5% vs ant.',    green: false },
      { label: '% sobre ventas',      value: ((totalDevMonto / totalVentas) * 100).toFixed(2) + '%', change: 'Dentro del rango', green: true },
      { label: 'Principal motivo',    value: 'Mal estado',              change: '3 de 10 casos',  green: false },
    ],
    cxc: [
      { label: 'Total CxC',           value: fmt(totalCxC),             change: '-5% vs ant.',    green: true  },
      { label: 'Al corriente',        value: fmt(cxcTable.filter(c => c.status === 'Al corriente').reduce((a,c)=>a+c.importe,0)), change: '2 cuentas', green: true  },
      { label: 'Por vencer ≤7 días',  value: fmt(cxcTable.filter(c => c.status === 'Por vencer').reduce((a,c)=>a+c.importe,0)),  change: '2 cuentas', green: false },
      { label: 'Vencidas',            value: fmt(cxcTable.filter(c => c.status === 'Vencida').reduce((a,c)=>a+c.importe,0)),     change: '2 cuentas', green: false },
    ],
  }

  const kpis = kpiMap[active]

  return (
    <div className="space-y-4">

      <PageHeader breadcrumb="Reportes" title="Reportes y Analítica" subtitle="Análisis detallado de ventas, inventario y operaciones">
        <button className="btn-secondary flex items-center gap-2"
          onClick={() => toast.success('Reporte generado', 'El PDF está listo para descargar')}>
          <FileText className="w-4 h-4" /> Exportar PDF
        </button>
        <button className="btn-secondary flex items-center gap-2"
          onClick={() => toast.success('Reporte generado', 'El archivo Excel está listo para descargar')}>
          <Table className="w-4 h-4" /> Exportar Excel
        </button>
      </PageHeader>
      <KpiBar items={[
        { label: 'Ventas del mes', value: '$512,000', good: true, sub: 'julio 2026' },
        { label: 'Transacciones', value: '1,847', sub: 'este mes' },
        { label: 'Ticket promedio', value: '$277', sub: 'por venta' },
        { label: 'Mejor día', value: 'Viernes', sub: '$31,200 vendidos' },
        { label: 'Crecimiento', value: '+8%', good: true, sub: 'vs mes anterior' },
      ]} />

      {/* Report type selector */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {reportTypes.map((r, i) => {
          const isAct = active === r.id
          return (
            <button
              key={r.id}
              onClick={() => setActive(r.id)}
              className="p-4 rounded-2xl border text-left transition-all animate-fade-in-up"
              style={{ animationDelay: `${Math.min(i * 55, 200)}ms`, ...(isAct
                ? { background: '#FFF7ED', border: '1px solid #F97316', boxShadow: '0 2px 12px rgba(249,115,22,.15)', color: '#C2410C' }
                : { background: '#fff', border: '1px solid #FDE8D0', boxShadow: '0 1px 3px rgba(38,52,66,.06)' }
              ) }}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
                style={{ background: isAct ? 'rgba(249,115,22,.15)' : '#FFF7ED' }}>
                <r.icon className="w-4 h-4" style={{ color: '#F97316' }} />
              </div>
              <p className="text-xs font-bold leading-tight" style={{ color: isAct ? '#C2410C' : '#263442' }}>{r.label}</p>
              <p className="text-[10px] mt-1 leading-tight" style={{ color: '#8FA1B2' }}>{r.desc}</p>
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <div className="card overflow-hidden mb-6">
        <div className="data-toolbar">
          <div className="data-toolbar-row flex-wrap">
            <div className="filter-bar">
              {[['hoy','Hoy'],['semana','Esta semana'],['mes','Este mes'],['trimestre','Últimos 90 días']].map(([k,l])=>(
                <button key={k} onClick={()=>selectPreset(k)} className={`chip ${activePreset===k?'active':''}`}>{l}</button>
              ))}
            </div>
          </div>
          <div className="data-toolbar-footer flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <label className="text-xs font-semibold whitespace-nowrap" style={{ color: '#627080' }}>Periodo:</label>
              <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} className="filter-input" />
              <span style={{ color: '#8FA1B2' }}>—</span>
              <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} className="filter-input" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <label className="text-xs font-semibold" style={{ color: '#627080' }}>Sucursal:</label>
              <select value={filterSuc} onChange={e => setFilterSuc(e.target.value)} className="filter-input">
                <option value="Todas">Todas</option>
                {['Centro','Norte','Sur','Oriente','Poniente'].map(s=><option key={s}>{s}</option>)}
              </select>
              {filterSuc !== 'Todas' && (
                <button onClick={() => setFilterSuc('Todas')} className="text-xs font-semibold px-2 py-1 rounded-lg"
                  style={{ color: '#C97A6D', background: 'rgba(201,122,109,.1)' }}>× Limpiar</button>
              )}
              <label className="text-xs font-semibold ml-2" style={{ color: '#627080' }}>Agrupar:</label>
              <div className="filter-bar">
                {['Día','Semana','Mes','Sucursal'].map(g=>(
                  <button key={g} onClick={()=>setGroupBy(g)} className={`chip ${groupBy===g?'active':''}`}>{g}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {!loaded ? <SkeletonReport /> : <>
      {/* Dynamic KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((c, i) => (
          <div key={c.label} className="card card-glow p-4 animate-fade-in-up" style={{ animationDelay: `${Math.min(i * 60, 200)}ms` }}>
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs font-medium leading-tight" style={{ color: '#8FA1B2' }}>{c.label}</p>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: c.green ? 'rgba(5,150,105,.1)' : 'rgba(201,122,109,.1)' }}>
                {c.green
                  ? <ArrowUpRight className="w-3.5 h-3.5" style={{ color: '#059669' }} />
                  : <ArrowDownRight className="w-3.5 h-3.5" style={{ color: '#C97A6D' }} />
                }
              </div>
            </div>
            <p className="text-xl font-black mb-2" style={{ color: '#263442' }}>{c.value}</p>
            <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={c.green
                ? { color: '#059669', background: 'rgba(5,150,105,.1)' }
                : { color: '#C97A6D', background: 'rgba(201,122,109,.1)' }
              }
            >{c.change}</span>
          </div>
        ))}
      </div>

      {/* ── VENTAS ── */}
      {active === 'ventas' && (
        <>
          <ChartCard title="Ventas por sucursal — Últimos 7 días" subtitle={`Total: ${fmt(totalVentas)}`} onExport={() => {}}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={groupedVentasChart} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#F2F3F5" vertical={false} />
                <XAxis dataKey="dia" tick={{fontSize:11,fill:'#8FA1B2'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize:11,fill:'#8FA1B2'}} axisLine={false} tickLine={false} tickFormatter={v=>`$${v/1000}k`} />
                <Tooltip formatter={(v,n)=>[fmt(v),n.charAt(0).toUpperCase()+n.slice(1)]} contentStyle={{borderRadius:12,border:'1px solid #FDE8D0'}} />
                <Legend wrapperStyle={{fontSize:12}} />
                {['centro','norte','sur','oriente'].filter(k => activeSucKeys.includes(k)).map((k,i)=>(
                  <Bar key={k} dataKey={k} stackId="a" fill={COLORS[activeSucKeys.indexOf(k)]} name={k.charAt(0).toUpperCase()+k.slice(1)} radius={i===activeSucKeys.length-1?[4,4,0,0]:[0,0,0,0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <TableCard title="Detalle por sucursal" onExport={() => toast.success('PDF listo', '')}>
            <div className="overflow-x-auto">
              <table className="table-modern">
                <thead><tr>{['Sucursal','Ventas','Transacciones','Ticket prom.','Devoluciones','Ganancia est.'].map(h=><th key={h}>{h}</th>)}</tr></thead>
                <tbody>
                  {filteredVentasTable.map(r=>(
                    <tr key={r.suc}>
                      <td className="font-semibold" style={{ color: '#263442' }}>{r.suc}</td>
                      <td className="font-bold" style={{ color: '#059669' }}>{fmt(r.ventas)}</td>
                      <td style={{ color: '#263442' }}>{r.txs}</td>
                      <td style={{ color: '#263442' }}>{fmt(r.ventas/r.txs)}</td>
                      <td className="font-medium" style={{ color: '#C97A6D' }}>{fmt(r.dev)}</td>
                      <td className="font-bold" style={{ color: '#F97316' }}>{fmt((r.ventas-r.dev)*0.35)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: '#FFF7ED', borderTop: '1px solid rgba(249,115,22,.15)' }}>
                    <td className="px-4 py-3 text-sm font-bold" style={{ color: '#263442' }}>Total</td>
                    <td className="px-4 py-3 text-sm font-bold" style={{ color: '#059669' }}>{fmt(358700)}</td>
                    <td className="px-4 py-3 text-sm font-bold" style={{ color: '#263442' }}>147</td>
                    <td className="px-4 py-3 text-sm font-bold" style={{ color: '#263442' }}>{fmt(358700/147)}</td>
                    <td className="px-4 py-3 text-sm font-bold" style={{ color: '#C97A6D' }}>{fmt(2340)}</td>
                    <td className="px-4 py-3 text-sm font-bold" style={{ color: '#F97316' }}>{fmt((358700-2340)*0.35)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </TableCard>
        </>
      )}

      {/* ── INVENTARIO ── */}
      {active === 'inventario' && (
        <>
          <ChartCard title="Stock actual vs mínimo requerido" subtitle="Los productos por debajo del mínimo requieren reabastecimiento" onExport={() => {}}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={inventarioChart} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#F2F3F5" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize:10,fill:'#8FA1B2'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize:11,fill:'#8FA1B2'}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{borderRadius:12,border:'1px solid #FDE8D0'}} />
                <Legend wrapperStyle={{fontSize:12}} />
                <Bar dataKey="stock"  fill="#F97316" name="Stock actual"      radius={[4,4,0,0]} />
                <Bar dataKey="minimo" fill="#FDE8D0" name="Mínimo requerido"  radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <TableCard title="Detalle de inventario" onExport={() => toast.success('PDF listo', '')}>
            <div className="overflow-x-auto">
              <table className="table-modern">
                <thead><tr>{['Producto','Categoría','Stock actual','Mínimo','Estado','Valor total'].map(h=><th key={h}>{h}</th>)}</tr></thead>
                <tbody>
                  {pagedInvTable.map(p=>(
                    <tr key={p.producto}>
                      <td className="font-semibold" style={{ color: '#263442' }}>{p.producto}</td>
                      <td><span className="tag tag-gray">{p.categoria}</span></td>
                      <td className="font-bold" style={{ color: p.stock < p.minimo ? '#C97A6D' : '#263442' }}>{p.stock}</td>
                      <td style={{ color: '#8FA1B2' }}>{p.minimo}</td>
                      <td><span className="text-xs font-bold px-2 py-0.5 rounded-full" style={statusInvSt[p.status]}>{p.status}</span></td>
                      <td className="font-semibold" style={{ color: '#627080' }}>{fmt(p.stock*p.precio)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: '#FFF7ED', borderTop: '1px solid rgba(249,115,22,.15)' }}>
                    <td className="px-4 py-3 text-sm font-bold" style={{ color: '#263442' }} colSpan={5}>Valor total inventario</td>
                    <td className="px-4 py-3 text-sm font-bold" style={{ color: '#F97316' }}>{fmt(totalInvVal)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <Pagination page={invPage} perPage={PAGE_SIZE} total={inventarioTable.length} onChange={setInvPage} />
          </TableCard>
        </>
      )}

      {/* ── DISTRIBUIDORES ── */}
      {active === 'distribuidores' && (
        <>
          <ChartCard title="Ventas vs Cobros por distribuidor" subtitle="Comparativa del periodo seleccionado" onExport={() => {}}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={distChart} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#F2F3F5" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize:11,fill:'#8FA1B2'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize:11,fill:'#8FA1B2'}} axisLine={false} tickLine={false} tickFormatter={v=>`$${v/1000}k`} />
                <Tooltip formatter={v=>[fmt(v)]} contentStyle={{borderRadius:12,border:'1px solid #FDE8D0'}} />
                <Legend wrapperStyle={{fontSize:12}} />
                <Bar dataKey="ventas" fill="#F97316" name="Ventas"  radius={[4,4,0,0]} />
                <Bar dataKey="cobros" fill="#059669" name="Cobros"  radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <TableCard title="Detalle por distribuidor" onExport={() => toast.success('PDF listo', '')}>
            <div className="overflow-x-auto">
              <table className="table-modern">
                <thead><tr>{['Distribuidor','Ruta','Clientes','Ventas','Cobros','Devoluciones','Saldo pendiente'].map(h=><th key={h}>{h}</th>)}</tr></thead>
                <tbody>
                  {filteredDistTable.map(d=>(
                    <tr key={d.nombre}>
                      <td className="font-semibold" style={{ color: '#263442' }}>{d.nombre}</td>
                      <td><span className="tag tag-orange">{d.ruta}</span></td>
                      <td style={{ color: '#263442' }}>{d.clientes}</td>
                      <td className="font-bold" style={{ color: '#059669' }}>{fmt(d.ventas)}</td>
                      <td className="font-semibold" style={{ color: '#F97316' }}>{fmt(d.cobros)}</td>
                      <td className="font-medium" style={{ color: '#C97A6D' }}>{fmt(d.devol)}</td>
                      <td className="font-bold" style={{ color: d.saldo>0 ? '#d97706' : '#8FA1B2' }}>{d.saldo>0?fmt(d.saldo):'—'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: '#FFF7ED', borderTop: '1px solid rgba(249,115,22,.15)' }}>
                    <td className="px-4 py-3 text-sm font-bold" style={{ color: '#263442' }} colSpan={3}>Total</td>
                    <td className="px-4 py-3 text-sm font-bold" style={{ color: '#059669' }}>{fmt(filteredDistTable.reduce((a,d)=>a+d.ventas,0))}</td>
                    <td className="px-4 py-3 text-sm font-bold" style={{ color: '#F97316' }}>{fmt(filteredDistTable.reduce((a,d)=>a+d.cobros,0))}</td>
                    <td className="px-4 py-3 text-sm font-bold" style={{ color: '#C97A6D' }}>{fmt(filteredDistTable.reduce((a,d)=>a+d.devol,0))}</td>
                    <td className="px-4 py-3 text-sm font-bold" style={{ color: '#d97706' }}>{fmt(filteredDistTable.reduce((a,d)=>a+d.saldo,0))}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </TableCard>
        </>
      )}

      {/* ── GANANCIAS ── */}
      {active === 'ganancias' && (
        <>
          <ChartCard title="Ingresos, COGS y Utilidad — Últimos 7 días" subtitle="Margen promedio del periodo: ~28%" onExport={() => {}}>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={ganChart}>
                <defs>
                  <linearGradient id="gIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#F97316" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0}    />
                  </linearGradient>
                  <linearGradient id="gCogs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#d97706" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0}    />
                  </linearGradient>
                  <linearGradient id="gGan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#059669" stopOpacity={0.2}  />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F2F3F5" vertical={false} />
                <XAxis dataKey="dia" tick={{fontSize:11,fill:'#8FA1B2'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize:11,fill:'#8FA1B2'}} axisLine={false} tickLine={false} tickFormatter={v=>`$${v/1000}k`} />
                <Tooltip formatter={v=>[fmt(v)]} contentStyle={{borderRadius:12,border:'1px solid #FDE8D0'}} />
                <Legend wrapperStyle={{fontSize:12}} />
                <Area type="monotone" dataKey="ingresos"  stroke="#F97316" fill="url(#gIngresos)" strokeWidth={2} name="Ingresos"      dot={false} />
                <Area type="monotone" dataKey="cogs"      stroke="#d97706" fill="url(#gCogs)"    strokeWidth={2} name="COGS"           dot={false} />
                <Area type="monotone" dataKey="ganancia"  stroke="#059669" fill="url(#gGan)"     strokeWidth={2} name="Utilidad neta"  dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
          <TableCard title="Desglose por sucursal" onExport={() => toast.success('PDF listo', '')}>
            <div className="overflow-x-auto">
              <table className="table-modern">
                <thead><tr>{['Sucursal','Ingresos','COGS (60%)','Gastos op.','Utilidad neta','Margen %'].map(h=><th key={h}>{h}</th>)}</tr></thead>
                <tbody>
                  {filteredGanTable.map(r=>(
                    <tr key={r.suc}>
                      <td className="font-semibold" style={{ color: '#263442' }}>{r.suc}</td>
                      <td className="font-bold" style={{ color: '#F97316' }}>{fmt(r.ingresos)}</td>
                      <td className="font-medium" style={{ color: '#d97706' }}>{fmt(r.cogs)}</td>
                      <td style={{ color: '#8FA1B2' }}>{fmt(r.gastos)}</td>
                      <td className="font-bold" style={{ color: '#059669' }}>{fmt(r.ganancia)}</td>
                      <td><span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color: '#059669', background: 'rgba(5,150,105,.1)' }}>{r.margen}%</span></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: '#FFF7ED', borderTop: '1px solid rgba(249,115,22,.15)' }}>
                    <td className="px-4 py-3 text-sm font-bold" style={{ color: '#263442' }}>Total</td>
                    <td className="px-4 py-3 text-sm font-bold" style={{ color: '#F97316' }}>{fmt(ganTable.reduce((a,r)=>a+r.ingresos,0))}</td>
                    <td className="px-4 py-3 text-sm font-bold" style={{ color: '#d97706' }}>{fmt(ganTable.reduce((a,r)=>a+r.cogs,0))}</td>
                    <td className="px-4 py-3 text-sm font-bold" style={{ color: '#8FA1B2' }}>{fmt(ganTable.reduce((a,r)=>a+r.gastos,0))}</td>
                    <td className="px-4 py-3 text-sm font-bold" style={{ color: '#059669' }}>{fmt(ganTable.reduce((a,r)=>a+r.ganancia,0))}</td>
                    <td className="px-4 py-3"><span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color: '#059669', background: 'rgba(5,150,105,.1)' }}>28%</span></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </TableCard>
        </>
      )}

      {/* ── DEVOLUCIONES ── */}
      {active === 'devoluciones' && (
        <>
          <ChartCard title="Devoluciones por día — Últimos 7 días" subtitle={`Total: ${fmt(totalDevMonto)} · ${devTable.length} devoluciones`} onExport={() => {}}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={devDias} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="#F2F3F5" vertical={false} />
                <XAxis dataKey="dia" tick={{fontSize:11,fill:'#8FA1B2'}} axisLine={false} tickLine={false} />
                <YAxis yAxisId="l" tick={{fontSize:11,fill:'#8FA1B2'}} axisLine={false} tickLine={false} />
                <YAxis yAxisId="r" orientation="right" tick={{fontSize:11,fill:'#8FA1B2'}} axisLine={false} tickLine={false} tickFormatter={v=>`$${v}`} />
                <Tooltip formatter={(v,n)=>[n==='monto'?fmt(v):v, n==='monto'?'Monto':'Cantidad']} contentStyle={{borderRadius:12,border:'1px solid #FDE8D0'}} />
                <Legend wrapperStyle={{fontSize:12}} />
                <Bar yAxisId="l" dataKey="cantidad" fill="#C97A6D" name="Cantidad"  radius={[4,4,0,0]} />
                <Bar yAxisId="r" dataKey="monto"    fill="rgba(201,122,109,.35)" name="Monto $"   radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <TableCard title="Historial de devoluciones" onExport={() => toast.success('PDF listo', '')}>
            <div className="overflow-x-auto">
              <table className="table-modern">
                <thead><tr>{['Folio','Fecha','Producto','Motivo','Monto','Sucursal','Estado'].map(h=><th key={h}>{h}</th>)}</tr></thead>
                <tbody>
                  {pagedDevTable.map(d=>(
                    <tr key={d.folio}>
                      <td><span className="folio">{d.folio}</span></td>
                      <td className="text-xs" style={{ color: '#8FA1B2' }}>{d.fecha}</td>
                      <td className="font-medium" style={{ color: '#263442' }}>{d.producto}</td>
                      <td className="text-xs" style={{ color: '#8FA1B2' }}>{d.motivo}</td>
                      <td className="font-bold" style={{ color: '#C97A6D' }}>{fmt(d.monto)}</td>
                      <td><span className="tag tag-gray">{d.sucursal}</span></td>
                      <td><span className="text-xs font-bold px-2 py-0.5 rounded-full" style={statusDevSt[d.status]}>{d.status}</span></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: 'rgba(201,122,109,.06)', borderTop: '1px solid rgba(201,122,109,.2)' }}>
                    <td className="px-4 py-3 text-sm font-bold" style={{ color: '#263442' }} colSpan={4}>Total devoluciones</td>
                    <td className="px-4 py-3 text-sm font-bold" style={{ color: '#C97A6D' }}>{fmt(totalDevMonto)}</td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
            <Pagination page={devPage} perPage={PAGE_SIZE} total={filteredDevTable.length} onChange={setDevPage} />
          </TableCard>
        </>
      )}

      {/* ── CxC ── */}
      {active === 'cxc' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="card p-5">
              <div className="mb-4">
                <h2 className="font-bold tracking-tight" style={{ color: '#263442' }}>CxC por antigüedad de deuda</h2>
                <p className="text-xs" style={{ color: '#8FA1B2' }}>Total: {fmt(totalCxC)}</p>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={cxcDonut} cx="50%" cy="50%" innerRadius={65} outerRadius={95} dataKey="value" paddingAngle={3}>
                    {cxcDonut.map((e)=><Cell key={e.label} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={v=>[fmt(v)]} contentStyle={{borderRadius:12,border:'1px solid #FDE8D0'}} />
                  <Legend wrapperStyle={{fontSize:12}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="card p-5">
              <h2 className="font-bold tracking-tight mb-4" style={{ color: '#263442' }}>Resumen por estado</h2>
              <div className="space-y-3">
                {[
                  {label:'Al corriente',        count:2, monto:13100, color:'#059669', bg:'rgba(5,150,105,.08)' },
                  {label:'Por vencer (≤7 días)', count:2, monto:13700, color:'#d97706', bg:'rgba(217,119,6,.08)' },
                  {label:'Vencidas',             count:2, monto:23800, color:'#C97A6D', bg:'rgba(201,122,109,.1)'},
                ].map(item=>(
                  <div key={item.label} className="flex items-center justify-between p-3.5 rounded-xl" style={{background:item.bg}}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{background:item.color}} />
                      <div>
                        <p className="text-xs font-semibold" style={{color:'#263442'}}>{item.label}</p>
                        <p className="text-[10px]" style={{color:'#8FA1B2'}}>{item.count} cuentas</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold" style={{color:item.color}}>{fmt(item.monto)}</p>
                  </div>
                ))}
                <div className="pt-3 mt-1 flex items-center justify-between" style={{ borderTop: '1px solid rgba(249,115,22,.15)' }}>
                  <p className="text-xs font-semibold" style={{ color: '#263442' }}>Total CxC</p>
                  <p className="text-sm font-black" style={{ color: '#F97316' }}>{fmt(totalCxC)}</p>
                </div>
              </div>
            </div>
          </div>
          <TableCard title="Detalle de cuentas por cobrar" onExport={() => toast.success('PDF listo', '')}>
            <div className="overflow-x-auto">
              <table className="table-modern">
                <thead><tr>{['Cliente / Distribuidor','RFC','Folio','Importe','Vencimiento','Días','Estado'].map(h=><th key={h}>{h}</th>)}</tr></thead>
                <tbody>
                  {cxcTable.map(c=>(
                    <tr key={c.folio}>
                      <td>
                        <p className="font-semibold" style={{ color: '#263442' }}>{c.nombre}</p>
                        <p className="text-xs" style={{ color: '#8FA1B2' }}>{c.tipo}</p>
                      </td>
                      <td><span className="text-xs font-mono" style={{ color: '#8FA1B2' }}>{c.rfc}</span></td>
                      <td><span className="folio">{c.folio}</span></td>
                      <td className="font-bold" style={{ color: '#263442' }}>{fmt(c.importe)}</td>
                      <td className="text-xs" style={{ color: '#8FA1B2' }}>{c.vencimiento}</td>
                      <td>
                        <span className="text-xs font-bold" style={{ color: c.dias<0 ? '#C97A6D' : c.dias<=7 ? '#d97706' : '#8FA1B2' }}>
                          {c.dias<0?`${Math.abs(c.dias)}d vencida`:`${c.dias}d restantes`}
                        </span>
                      </td>
                      <td><span className="text-xs font-bold px-2 py-0.5 rounded-full" style={statusCxcSt[c.status]}>{c.status}</span></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: '#FFF7ED', borderTop: '1px solid rgba(249,115,22,.15)' }}>
                    <td className="px-4 py-3 text-sm font-bold" style={{ color: '#263442' }} colSpan={3}>Total CxC</td>
                    <td className="px-4 py-3 text-sm font-bold" style={{ color: '#F97316' }}>{fmt(totalCxC)}</td>
                    <td colSpan={3} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </TableCard>
        </>
      )}
      </>}
    </div>
  )
}
