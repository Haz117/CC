import { useState, useEffect, useMemo } from 'react'
import { ShoppingCart, Search, Eye, XCircle, RotateCcw, Download, DollarSign, CreditCard, Smartphone, Plus, TrendingDown, AlertTriangle, CheckCircle2, Milk, TrendingUp, X } from 'lucide-react'
import { downloadCSV } from '../utils/csv'
import Modal from '../components/Modal'
import SortTh from '../components/SortTh'
import { useSort } from '../hooks/useSort'
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { SkeletonTableRows } from '../components/Skeleton'
import Badge from '../components/Badge'
import ConfirmDialog from '../components/ConfirmDialog'
import Pagination from '../components/Pagination'
import toast from '../utils/toast'
import SearchInput from '../components/SearchInput'
import PageHeader from '../components/PageHeader'
import KpiBar from '../components/KpiBar'
import { usePersistedState } from '../hooks/usePersistedState'
import { useDebounce } from '../hooks/useDebounce'
import { INIT_VENTAS, ventasSemana } from '../data/ventas'
import { fmtDec as fmt } from '../utils/fmt'
import { useLoadDelay } from '../hooks/useLoadDelay'
import { useEscapeKey } from '../hooks/useEscapeKey'
import ModalFooter from '../components/ModalFooter'
import EmptyState from '../components/EmptyState'
import FormField from '../components/FormField'
import AlertBanner from '../components/AlertBanner'
import ChartTooltip from '../components/ChartTooltip'

const metodoIcon = { Efectivo: DollarSign, Tarjeta: CreditCard, Transferencia: Smartphone, Crédito: CreditCard }
const statusColor = { Completada: 'green', Cancelada: 'red', Pendiente: 'amber', Devuelta: 'purple' }
const rowStyle = (status) => {
  if (status === 'Cancelada') return { background: 'rgba(201,122,109,.04)', borderLeft: '3px solid rgba(201,122,109,.4)' }
  if (status === 'Devuelta')  return { background: 'rgba(124,58,237,.04)', borderLeft: '3px solid rgba(124,58,237,.25)' }
  return {}
}

export default function Ventas() {
  const PER_PAGE = 6
  const loaded = useLoadDelay()
  const [ventas, setVentas] = useState(INIT_VENTAS)
  const [search, setSearch] = usePersistedState('ventas-search', '')
  const debouncedSearch = useDebounce(search)
  const [filterStatus, setFilterStatus] = usePersistedState('ventas-status', 'Todas')
  const [page, setPage] = useState(1)
  const [selectedVenta, setSelectedVenta] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmCancelId, setConfirmCancelId] = useState(null)
  const [dateFrom, setDateFrom] = useState('2026-07-29')
  const [dateTo, setDateTo] = useState('2026-07-29')
  const { sortKey, sortDir, handleSort } = useSort('fecha', 'desc')
  const [activePreset, setActivePreset] = useState('hoy')
  const [selectedIds, setSelectedIds] = useState(new Set())

  const applyPreset = (preset) => {
    const today = new Date('2026-07-31')
    const fmt = d => d.toISOString().slice(0, 10)
    if (preset === 'hoy') { setDateFrom(fmt(today)); setDateTo(fmt(today)) }
    else if (preset === 'ayer') {
      const y = new Date(today); y.setDate(today.getDate() - 1)
      setDateFrom(fmt(y)); setDateTo(fmt(y))
    }
    else if (preset === 'semana') {
      const start = new Date(today); start.setDate(today.getDate() - today.getDay() + 1)
      setDateFrom(fmt(start)); setDateTo(fmt(today))
    }
    else if (preset === 'mes') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1)
      setDateFrom(fmt(start)); setDateTo(fmt(today))
    }
  }

  const selectPreset = (p) => { setActivePreset(p); applyPreset(p) }

  const cancelVenta = (id) => {
    const snapshot = ventas.map(x => ({ ...x }))
    setVentas(prev => prev.map(v => v.id === id ? { ...v, status: 'Cancelada' } : v))
    toast.error('Venta cancelada', id, { label: 'Deshacer', fn: () => setVentas(snapshot) })
    setConfirmCancelId(null)
  }

  const toggleSelect = (id) =>
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const toggleSelectAll = () => {
    const visibleIds = paginated.map(v => v.id)
    const allSelected = visibleIds.every(id => selectedIds.has(id))
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (allSelected) visibleIds.forEach(id => next.delete(id))
      else visibleIds.forEach(id => next.add(id))
      return next
    })
  }

  const clearSelection = () => setSelectedIds(new Set())

  const cancelSelected = () => {
    const snapshot = ventas.map(x => ({ ...x }))
    setVentas(prev =>
      prev.map(v => selectedIds.has(v.id) && v.status !== 'Cancelada' ? { ...v, status: 'Cancelada' } : v)
    )
    const count = selectedIds.size
    toast.error(`${count} venta${count > 1 ? 's' : ''} cancelada${count > 1 ? 's' : ''}`, '', {
      label: 'Deshacer',
      fn: () => setVentas(snapshot),
    })
    clearSelection()
  }

  const handleExportCSV = (rows) => {
    const csvRows = rows.map(v => ({
      id: v.id,
      fecha: v.fecha,
      cajero: v.cajero,
      sucursal: v.sucursal,
      metodo: v.metodo,
      total: v.total,
      status: v.status,
    }))
    downloadCSV(csvRows, 'ventas')
  }

  const filtered = useMemo(() => ventas.filter(v =>
    (v.id.toLowerCase().includes(debouncedSearch.toLowerCase()) || v.cajero.toLowerCase().includes(debouncedSearch.toLowerCase()) || v.sucursal.toLowerCase().includes(debouncedSearch.toLowerCase())) &&
    (filterStatus === 'Todas' || v.status === filterStatus)
  ), [ventas, debouncedSearch, filterStatus])

  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    const mult = sortDir === 'asc' ? 1 : -1
    if (sortKey === 'total') return mult * (a.total - b.total)
    return mult * String(a[sortKey]).localeCompare(String(b[sortKey]))
  }), [filtered, sortKey, sortDir])

  const paginated = useMemo(() => sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE), [sorted, page])

  const ventaStats = useMemo(() => {
    let completadas = 0, pendientes = 0, totalHoy = 0
    const canceladas = [], devueltas = []
    for (const v of ventas) {
      if (v.status === 'Completada') { completadas++; totalHoy += v.total }
      else if (v.status === 'Pendiente') pendientes++
      else if (v.status === 'Cancelada') canceladas.push(v)
      else if (v.status === 'Devuelta')  devueltas.push(v)
    }
    return { completadas, pendientes, canceladas, devueltas, totalHoy }
  }, [ventas])
  const { completadas: completadasCount, pendientes: pendientesCount, canceladas, devueltas, totalHoy } = ventaStats

  const totalVentas = useMemo(
    () => filtered.filter(v => v.status === 'Completada').reduce((a, v) => a + v.total, 0),
    [filtered]
  )

  useEffect(() => { setPage(1); setSelectedIds(new Set()) }, [debouncedSearch, filterStatus, sortKey, sortDir])
  useEscapeKey(() => { setSelectedVenta(null); setModalOpen(false); setExpandedId(null) })

  return (
    <div className="space-y-6">

      <PageHeader
        breadcrumb="Ventas"
        title="Registro de Ventas"
        subtitle={`Control de transacciones · ${ventas.length} registros totales`}
      >
        <button onClick={() => handleExportCSV(filtered)} className="btn-secondary">
          <Download className="w-4 h-4" /> Exportar CSV
        </button>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Nueva venta
        </button>
      </PageHeader>

      <KpiBar items={[
        { label: 'Completadas',   value: completadasCount,   sub: 'hoy',                good: true              },
        { label: 'Pendientes',    value: pendientesCount,    sub: 'crédito / cobro'                             },
        { label: 'Canceladas',    value: canceladas.length,  sub: 'requieren revisión', alert: canceladas.length > 0 },
        { label: 'Total cobrado', value: fmt(totalHoy),      sub: 'ventas completadas', good: true              },
      ]} />

      {/* ══ Resumen visual — solo desktop ══════════════════════════ */}
      <div className="hidden lg:grid lg:grid-cols-5 gap-5">
        {/* Tendencia semanal */}
        <div className="card p-5 lg:col-span-3">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 flex-shrink-0" style={{ color: '#F97316' }} />
            <span className="text-sm font-bold" style={{ color: '#263442' }}>Tendencia semanal</span>
            <span className="text-xs ml-auto" style={{ color: '#8FA1B2' }}>últimos 7 días</span>
          </div>
          <ResponsiveContainer width="100%" height={148}>
            <BarChart data={ventasSemana} barSize={24} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#FDE8D0" />
              <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#8FA1B2' }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#FFF7ED' }} content={props => <ChartTooltip {...props} format={fmt} />} />
              <Bar dataKey="total" radius={[5, 5, 0, 0]}>
                {ventasSemana.map((v, i) => <Cell key={v.dia} fill={i === 5 ? '#F97316' : '#FDBA74'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribución por estado */}
        <div className="card p-5 flex flex-col lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="w-4 h-4 flex-shrink-0" style={{ color: '#F97316' }} />
            <span className="text-sm font-bold" style={{ color: '#263442' }}>Por estado</span>
          </div>
          <div className="flex flex-col gap-3 flex-1 justify-center">
            {[
              { label: 'Completadas', count: completadasCount,    color: '#059669', bg: 'rgba(5,150,105,.1)' },
              { label: 'Pendientes',  count: pendientesCount,     color: '#d97706', bg: 'rgba(217,119,6,.1)' },
              { label: 'Canceladas',  count: canceladas.length,   color: '#C97A6D', bg: 'rgba(201,122,109,.1)' },
              { label: 'Devueltas',   count: devueltas.length,    color: '#7c3aed', bg: 'rgba(124,58,237,.12)' },
            ].map(s => {
              const pct = ventas.length ? Math.round(s.count / ventas.length * 100) : 0
              return (
                <div key={s.label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: s.bg }}>
                    <span className="text-xs font-black" style={{ color: s.color }}>{s.count}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-semibold" style={{ color: '#627080' }}>{s.label}</span>
                      <span className="text-xs font-bold" style={{ color: s.color }}>{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: '#FDE8D0' }}>
                      <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: s.color }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-4 pt-4 flex items-center justify-between" style={{ borderTop: '1px solid #FDE8D0' }}>
            <span className="text-xs" style={{ color: '#8FA1B2' }}>Total hoy</span>
            <span className="text-sm font-black" style={{ color: '#F97316' }}>{fmt(totalHoy)}</span>
          </div>
        </div>
      </div>

      {/* ══ Alerta de cancelaciones ══════════════════════════════ */}
      {canceladas.length > 0 && (
        <AlertBanner
          icon={AlertTriangle}
          title={`${canceladas.length} venta${canceladas.length > 1 ? 's' : ''} cancelada${canceladas.length > 1 ? 's' : ''} hoy — requieren revisión`}
          subtitle={canceladas.map(v => `${v.id} · ${fmt(v.total)}`).join('  ·  ')}
          className="mt-5"
        />
      )}

      {/* ══ Data Section ══════════════════════════════════════════ */}
      {!loaded ? <SkeletonTableRows /> : <div className="card overflow-hidden">

        {/* Toolbar */}
        <div className="data-toolbar">
          <div className="data-toolbar-row">
            <div style={{ flex: 1, minWidth: 200 }}>
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Buscar por folio, cajero, sucursal..."
                resultCount={filtered.length}
              />
            </div>
            <div className="filter-group">
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="filter-input" />
              <span className="date-range-sep">—</span>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="filter-input" />
              {[['hoy','Hoy'],['ayer','Ayer'],['semana','Semana'],['mes','Mes']].map(([k,l])=>(
                <button key={k} onClick={()=>selectPreset(k)}
                  className={`preset-chip ${activePreset===k ? 'active' : 'idle'}`}
                >{l}</button>
              ))}
              <select className="filter-input">
                <option>Todas las sucursales</option>
                {['Centro','Norte','Sur','Oriente','Poniente'].map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="data-toolbar-footer">
            <div className="filter-bar flex-wrap">
              {['Todas','Completada','Pendiente','Cancelada','Devuelta'].map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`chip ${filterStatus === s ? 'active' : ''}`}
                  style={s === 'Cancelada' && filterStatus === s ? { background: 'rgba(201,122,109,.15)', color: '#A05A52', borderColor: 'rgba(201,122,109,.35)' } : {}}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="toolbar-summary">
              <span><b>{filtered.length}</b> ventas</span>
              <span className="sep">·</span>
              <span>Total: <b>{fmt(totalVentas)}</b></span>
            </div>
          </div>
        </div>

        {/* Section head */}
        <div className="section-head">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 flex-shrink-0" style={{ color: '#F97316' }} />
            <span className="section-head-text"><strong>Transacciones</strong></span>
            <span style={{ fontSize: '.7rem', color: '#8FA1B2' }}>{sorted.length} resultado{sorted.length !== 1 ? 's' : ''}</span>
            {canceladas.length > 0 && <span className="badge" style={{ background: 'rgba(201,122,109,.1)', color: '#A05A52' }}>{canceladas.length} canceladas</span>}
            {devueltas.length > 0 && <span className="badge" style={{ background: 'rgba(124,58,237,.1)', color: '#7c3aed' }}>{devueltas.length} devueltas</span>}
          </div>
          <button className="btn-ghost" style={{ fontSize: '.75rem', gap: 5, padding: '5px 10px' }} onClick={() => window.print()}>
            <Download className="w-3.5 h-3.5" /> Imprimir
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto table-card">
          <table className="table-modern animate-rows">
            <thead>
              <tr>
                <th style={{ width: 36, paddingLeft: 14, paddingRight: 0 }}>
                  <input
                    type="checkbox"
                    aria-label="Seleccionar todos"
                    checked={paginated.length > 0 && paginated.every(v => selectedIds.has(v.id))}
                    onChange={toggleSelectAll}
                    style={{ accentColor: '#F97316', width: 15, height: 15, cursor: 'pointer' }}
                  />
                </th>
                <SortTh col="id" label="Folio" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortTh col="fecha" label="Fecha" className="hidden sm:table-cell" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortTh col="sucursal" label="Sucursal / Caja" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <th className="hidden lg:table-cell">Cajero</th>
                <th className="hidden md:table-cell">Método</th>
                <SortTh col="total" label="Total" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortTh col="status" label="Estado" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(v => {
                const MIcon = metodoIcon[v.metodo] || DollarSign
                const isExpanded = expandedId === v.id
                const isSelected = selectedIds.has(v.id)
                return (
                  <>
                    <tr
                      key={v.id}
                      className="cursor-pointer"
                      style={{
                        ...rowStyle(v.status),
                        ...(isSelected ? { background: 'rgba(249,115,22,.06)' } : {}),
                        ...(isExpanded && !isSelected ? { background: '#FFF7ED' } : {}),
                      }}
                      onClick={() => setExpandedId(isExpanded ? null : v.id)}
                    >
                      <td data-label="" style={{ paddingLeft: 14, paddingRight: 0 }} onClick={e => { e.stopPropagation(); toggleSelect(v.id) }}>
                        <input
                          type="checkbox"
                          aria-label={`Seleccionar ${v.id}`}
                          checked={isSelected}
                          onChange={() => toggleSelect(v.id)}
                          style={{ accentColor: '#F97316', width: 15, height: 15, cursor: 'pointer' }}
                        />
                      </td>
                      <td data-label="Folio">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="inline-block w-3.5 h-3.5 rounded-sm text-center leading-none transition-transform duration-200 flex-shrink-0"
                            style={{
                              background: isExpanded ? '#F97316' : '#FFF7ED',
                              color: isExpanded ? '#fff' : '#F97316',
                              fontSize: 9, fontWeight: 800,
                              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'
                            }}
                          >▶</span>
                          <span className="folio">{v.id}</span>
                        </div>
                      </td>
                      <td data-label="Fecha" className="hidden sm:table-cell">
                        <div>
                          <p className="text-xs font-medium" style={{ color: '#263442' }}>{v.fecha.split(' ')[1]}</p>
                          <p className="text-xs" style={{ color: '#8FA1B2' }}>{v.fecha.split(' ')[0]}</p>
                        </div>
                      </td>
                      <td data-label="Sucursal">
                        <p className="text-sm font-medium" style={{ color: '#263442' }}>{v.sucursal}</p>
                        <p className="text-xs" style={{ color: '#8FA1B2' }}>{v.caja}</p>
                      </td>
                      <td data-label="Cajero" className="hidden lg:table-cell">
                        <span className="text-sm" style={{ color: '#627080' }}>{v.cajero}</span>
                      </td>
                      <td data-label="Método" className="hidden md:table-cell">
                        <div className="flex items-center gap-1.5">
                          <MIcon className="w-3.5 h-3.5" style={{ color: '#FED7AA' }} />
                          <span className="text-sm" style={{ color: '#627080' }}>{v.metodo}</span>
                        </div>
                      </td>
                      <td data-label="Total">
                        <span
                          className="text-sm font-bold"
                          style={{ color: v.status === 'Cancelada' ? '#C97A6D' : v.status === 'Devuelta' ? '#7c3aed' : '#263442' }}
                        >
                          {v.status === 'Cancelada' && <TrendingDown className="w-3 h-3 inline mr-1 opacity-70" />}
                          {fmt(v.total)}
                        </span>
                      </td>
                      <td data-label="Estado"><Badge label={v.status} color={statusColor[v.status]} /></td>
                      <td data-label="Acciones" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-0.5">
                          <button onClick={() => setSelectedVenta(v)} className="action-btn" title="Ver ticket completo">
                            <Eye className="w-4 h-4" />
                          </button>
                          {v.status === 'Completada' && (
                            <button
                              className="action-btn danger"
                              title="Cancelar venta"
                              onClick={() => setConfirmCancelId(v.id)}
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                          {v.status === 'Completada' && (
                            <button
                              className="action-btn danger"
                              title="Devolución"
                              onClick={() => toast.info('Devolución iniciada', `${v.id} · ${fmt(v.total)} — proceso de devolución registrado`)}
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${v.id}-exp`} style={{ background: '#FFF7ED' }}>
                        <td colSpan={9} className="px-6 py-3">
                          <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#8FA1B2' }}>Cajero</span>
                              <span className="text-xs font-semibold" style={{ color: '#263442' }}>{v.cajero}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#8FA1B2' }}>Método</span>
                              <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#263442' }}>
                                <MIcon className="w-3 h-3" style={{ color: '#FED7AA' }} />{v.metodo}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#8FA1B2' }}>Artículos</span>
                              <span className="text-xs font-semibold" style={{ color: '#263442' }}>{v.items}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#8FA1B2' }}>Total</span>
                              <span className="text-xs font-black" style={{ color: v.status === 'Cancelada' ? '#C97A6D' : '#059669' }}>{fmt(v.total)}</span>
                            </div>
                            <button
                              className="ml-auto text-xs font-semibold px-3 py-1 rounded-lg transition-colors"
                              style={{ color: '#F97316', background: 'rgba(249,115,22,.1)' }}
                              onClick={() => { setSelectedVenta(v); setExpandedId(null) }}
                            >
                              Ver ticket completo →
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <EmptyState icon={Search} title="Sin resultados" subtitle="Intenta con otro término de búsqueda o limpia los filtros." />
        )}

        {/* ── Bulk action bar ─────────────────────────────────── */}
        <div
          style={{
            overflow: 'hidden',
            maxHeight: selectedIds.size > 0 ? 64 : 0,
            opacity: selectedIds.size > 0 ? 1 : 0,
            transition: 'max-height .28s cubic-bezier(.16,1,.3,1), opacity .22s ease',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 16px',
              background: '#FFF7ED',
              borderTop: '1px solid #FDE8D0',
              borderBottom: '1px solid #FDE8D0',
            }}
          >
            <span style={{ fontSize: '.82rem', fontWeight: 700, color: '#C2410C', flex: 1 }}>
              {selectedIds.size} seleccionada{selectedIds.size !== 1 ? 's' : ''}
            </span>
            {/* Cancel selected — only if at least one non-cancelled row is selected */}
            {(() => {
              const selectableIds = [...selectedIds].filter(id => {
                const v = ventas.find(x => x.id === id)
                return v && v.status !== 'Cancelada'
              })
              return selectableIds.length > 0 ? (
                <button
                  onClick={cancelSelected}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: '.78rem', fontWeight: 700,
                    padding: '6px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                    background: 'rgba(201,122,109,.12)', color: '#A05A52',
                    transition: 'background .15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,122,109,.22)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(201,122,109,.12)' }}
                >
                  <XCircle style={{ width: 14, height: 14 }} /> Cancelar selección
                </button>
              ) : null
            })()}
            <button
              onClick={clearSelection}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                fontSize: '.78rem', fontWeight: 600,
                padding: '6px 12px', borderRadius: 10, border: '1px solid #FDE8D0', cursor: 'pointer',
                background: '#fff', color: '#8FA1B2',
                transition: 'border-color .15s, color .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#FDBA74'; e.currentTarget.style.color = '#F97316' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#FDE8D0'; e.currentTarget.style.color = '#8FA1B2' }}
            >
              <X style={{ width: 13, height: 13 }} /> Descartar
            </button>
          </div>
        </div>

        <Pagination total={sorted.length} page={page} perPage={PER_PAGE} onChange={setPage} />
      </div>}

      {/* ══ Venta detail modal ════════════════════════════════════ */}
      {selectedVenta && (
        <Modal id="ticket-print-area" maxWidth="sm" onClose={() => setSelectedVenta(null)} header={<div><div className="flex items-center gap-2"><h3 className="font-bold" style={{ color: '#263442' }}>{selectedVenta.id}</h3><Badge label={selectedVenta.status} color={statusColor[selectedVenta.status]} /></div><p className="text-xs mt-0.5" style={{ color: '#8FA1B2' }}>{selectedVenta.fecha}</p></div>}>
            <div className="p-0">
              {/* Receipt header */}
              <div className="px-6 pt-6 pb-5 text-center" style={{ borderBottom: '2px dashed #FDE8D0' }}>
                <div
                  className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                  style={{ background: '#FFF7ED' }}
                >
                  <Milk className="w-6 h-6" style={{ color: '#F97316' }} />
                </div>
                <p className="font-black text-sm" style={{ color: '#263442' }}>Cremerías Admin</p>
                <p className="text-xs mt-0.5" style={{ color: '#8FA1B2' }}>Suc. {selectedVenta.sucursal} · {selectedVenta.caja}</p>
                <p className="text-xs mt-0.5" style={{ color: '#FED7AA' }}>{selectedVenta.fecha}</p>
              </div>

              {/* Status alert for cancelled */}
              {selectedVenta.status === 'Cancelada' && (
                <div className="mx-6 mt-4 flex items-center gap-2.5 rounded-xl px-3 py-2.5" style={{ background: 'rgba(201,122,109,.08)', border: '1px solid rgba(201,122,109,.25)' }}>
                  <XCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#C97A6D' }} />
                  <p className="text-xs font-semibold" style={{ color: '#A05A52' }}>Esta venta fue cancelada y no generó ingreso</p>
                </div>
              )}

              {/* Info rows */}
              <div className="px-6 py-4 space-y-3" style={{ borderBottom: '2px dashed #FDE8D0' }}>
                {[
                  ['Cajero', selectedVenta.cajero],
                  ['Método de pago', selectedVenta.metodo],
                  ['Artículos', `${selectedVenta.items} artículo${selectedVenta.items !== 1 ? 's' : ''}`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center">
                    <span className="text-xs font-medium" style={{ color: '#8FA1B2' }}>{k}</span>
                    <span className="text-sm font-semibold" style={{ color: '#627080' }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="px-6 py-5 text-center">
                <p
                  className="text-[10px] font-bold uppercase tracking-widest mb-2"
                  style={{ color: selectedVenta.status === 'Cancelada' ? '#C97A6D' : '#F97316' }}
                >
                  Total de venta
                </p>
                <p
                  className="text-4xl font-black"
                  style={{ color: selectedVenta.status === 'Cancelada' ? '#C97A6D' : '#C2410C' }}
                >
                  {fmt(selectedVenta.total)}
                </p>
                {selectedVenta.status === 'Completada' && (
                  <div
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                    style={{ background: 'rgba(5,150,105,.1)', color: '#059669' }}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Pago recibido
                  </div>
                )}
                {selectedVenta.status === 'Devuelta' && (
                  <div
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                    style={{ background: 'rgba(124,58,237,.1)', color: '#7c3aed' }}
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Devolución procesada
                  </div>
                )}
                {selectedVenta.status === 'Pendiente' && (
                  <div
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                    style={{ background: 'rgba(217,119,6,.1)', color: '#d97706' }}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" /> Pago pendiente
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 flex justify-between gap-3" style={{ borderTop: '1px solid #FDE8D0' }}>
              <button
                className="btn-secondary flex items-center gap-2"
                onClick={() => window.print()}
              >
                <Download className="w-4 h-4" /> Imprimir ticket
              </button>
              <button onClick={() => setSelectedVenta(null)} className="btn-primary">Cerrar</button>
            </div>
        </Modal>
      )}

      {/* ══ Confirm: Cancelar venta ══════════════════════════════ */}
      {confirmCancelId && (() => {
        const v = ventas.find(x => x.id === confirmCancelId)
        return (
          <ConfirmDialog
            title="¿Cancelar esta venta?"
            message={`La venta ${v?.id} por ${fmt(v?.total ?? 0)} será marcada como cancelada. Podrás deshacer esta acción con el botón en la notificación.`}
            confirmLabel="Sí, cancelar"
            onConfirm={() => cancelVenta(confirmCancelId)}
            onCancel={() => setConfirmCancelId(null)}
          />
        )
      })()}

      {/* ══ Nueva venta modal ════════════════════════════════════ */}
      {modalOpen && (
        <Modal title="Nueva venta" subtitle="Registrar transacción" onClose={() => setModalOpen(false)}>
            <div className="p-6 space-y-4">
              <FormField label="Sucursal">
                <select className="input-field" autoFocus>
                  {['Centro', 'Norte', 'Sur', 'Oriente', 'Poniente'].map(s => <option key={s}>{s}</option>)}
                </select>
              </FormField>
              <FormField label="Método de pago">
                <select className="input-field">
                  {['Efectivo', 'Tarjeta', 'Transferencia', 'Crédito'].map(m => <option key={m}>{m}</option>)}
                </select>
              </FormField>
              <FormField label="Total">
                <input type="number" placeholder="0.00" min="0" step="0.01" className="input-field" />
              </FormField>
            </div>
            <ModalFooter onCancel={() => setModalOpen(false)} onConfirm={() => { toast.success('Venta registrada', 'La transacción fue guardada'); setModalOpen(false) }} confirmLabel="Registrar venta" />
        </Modal>
      )}
    </div>
  )
}
