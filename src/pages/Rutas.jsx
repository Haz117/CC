import { useState, useEffect, useMemo, useRef } from 'react'
import { Map, Plus, Clock, CheckCircle, AlertCircle, Truck, Eye, Navigation, Edit, Trash2, RotateCcw, TrendingUp } from 'lucide-react'
import Modal from '../components/Modal'
import SortTh from '../components/SortTh'
import { useSort } from '../hooks/useSort'
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { SkeletonTableRows } from '../components/Skeleton'
import Badge from '../components/Badge'
import ConfirmDialog from '../components/ConfirmDialog'
import toast from '../utils/toast'
import PageHeader from '../components/PageHeader'
import KpiBar from '../components/KpiBar'
import Pagination from '../components/Pagination'
import { rutas } from '../data/rutas'
import { fmt } from '../utils/fmt'
import { useLoadDelay } from '../hooks/useLoadDelay'
import { useEscapeKey } from '../hooks/useEscapeKey'
import { useDebounce } from '../hooks/useDebounce'
import { usePersistedState } from '../hooks/usePersistedState'
import SearchInput from '../components/SearchInput'
import ModalFooter from '../components/ModalFooter'
import EmptyState from '../components/EmptyState'
import FormField from '../components/FormField'
import InfoCell from '../components/InfoCell'

const statusColor = { 'En proceso': 'amber', 'Finalizada': 'green', 'Pendiente': 'gray', 'Cancelada': 'red' }
const statusIcon  = { 'En proceso': Navigation, 'Finalizada': CheckCircle, 'Pendiente': Clock, 'Cancelada': AlertCircle }
const iconBg = {
  'En proceso': { background: 'rgba(217,119,6,.15)', color: '#d97706' },
  'Finalizada':  { background: 'rgba(5,150,105,.15)',  color: '#059669' },
  'Pendiente':   { background: '#F2F3F5',              color: '#8FA1B2' },
  'Cancelada':   { background: 'rgba(201,122,109,.15)', color: '#C97A6D' },
}

const BLANK_RUTA = { nombre: '', distribuidor: '', vehiculo: '', hora: '' }

export default function Rutas() {
  const PER_PAGE = 5
  const loaded = useLoadDelay()
  const [filter, setFilter]           = usePersistedState('rutas-filter', 'Todas')
  const [search, setSearch]           = usePersistedState('rutas-search', '')
  const debouncedSearch = useDebounce(search)
  const [page, setPage]               = useState(1)
  const [showModal, setShowModal]     = useState(false)
  const [selected, setSelected]       = useState(null)
  const [confirmDel, setConfirmDel]   = useState(null)
  const [data, setData]               = useState(rutas)
  const [rutaForm, setRutaForm]       = useState(BLANK_RUTA)
  const [rutaErrors, setRutaErrors]   = useState({})
  const [shake, setShake]             = useState(false)
  const shakeTimer = useRef(null)
  const { sortKey, sortDir, handleSort } = useSort('nombre')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editRuta, setEditRuta]           = useState(null)
  const [editForm, setEditForm]           = useState({})
  const [editErrors, setEditErrors]       = useState({})

  const rutaStats = useMemo(() => {
    let enProceso = 0, finalizadas = 0, canceladas = 0, pendientes = 0, totalVentas = 0
    for (const r of data) {
      if (r.status === 'En proceso')  enProceso++
      else if (r.status === 'Finalizada') finalizadas++
      else if (r.status === 'Cancelada')  canceladas++
      else if (r.status === 'Pendiente')  pendientes++
      totalVentas += r.ventas
    }
    return { enProceso, finalizadas, canceladas, pendientes, totalVentas }
  }, [data])
  const { enProceso, finalizadas, canceladas, pendientes, totalVentas } = rutaStats

  const filtered = useMemo(() => data.filter(r =>
    (filter === 'Todas' || r.status === filter) &&
    (!debouncedSearch || r.nombre.toLowerCase().includes(debouncedSearch.toLowerCase()) || r.distribuidor.toLowerCase().includes(debouncedSearch.toLowerCase()))
  ), [data, filter, debouncedSearch])

  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    const mult = sortDir === 'asc' ? 1 : -1
    return mult * String(a[sortKey] ?? '').localeCompare(String(b[sortKey] ?? ''))
  }), [filtered, sortKey, sortDir])

  const paginated = useMemo(() => sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE), [sorted, page])

  const validateRuta = () => {
    const errs = {}
    if (!rutaForm.nombre.trim())      errs.nombre      = 'El nombre de la ruta es requerido'
    if (!rutaForm.distribuidor)       errs.distribuidor = 'Selecciona un distribuidor'
    if (!rutaForm.vehiculo.trim())    errs.vehiculo     = 'Ingresa la placa del vehículo'
    return errs
  }

  const handleCrearRuta = () => {
    const errs = validateRuta()
    if (Object.keys(errs).length > 0) {
      setRutaErrors(errs)
      setShake(true)
      clearTimeout(shakeTimer.current)
      shakeTimer.current = setTimeout(() => setShake(false), 400)
      return
    }
    toast.success('Ruta creada', `${rutaForm.nombre} fue programada exitosamente`)
    setShowModal(false)
    setRutaForm(BLANK_RUTA)
    setRutaErrors({})
  }

  const deleteRuta = (r) => {
    setData(d => d.filter(x => x.id !== r.id))
    toast.error('Ruta eliminada', `${r.nombre} fue eliminada del sistema`)
    setConfirmDel(null)
  }

  const openEdit = (r) => {
    setEditRuta(r)
    setEditForm({ nombre: r.nombre, distribuidor: r.distribuidor, vehiculo: r.vehiculo, salida: r.salida === '--' ? '' : r.salida })
    setEditErrors({})
    setShowEditModal(true)
    setSelected(null)
  }

  const handleSaveEdit = () => {
    const errs = {}
    if (!editForm.nombre.trim())     errs.nombre      = 'El nombre es requerido'
    if (!editForm.distribuidor)      errs.distribuidor = 'Selecciona un distribuidor'
    if (!editForm.vehiculo.trim())   errs.vehiculo     = 'Ingresa la placa del vehículo'
    if (Object.keys(errs).length > 0) { setEditErrors(errs); return }
    setData(d => d.map(r => r.id === editRuta.id
      ? { ...r, nombre: editForm.nombre, distribuidor: editForm.distribuidor, vehiculo: editForm.vehiculo, salida: editForm.salida || '--' }
      : r
    ))
    toast.success('Ruta actualizada', `${editForm.nombre} fue modificada correctamente`)
    setShowEditModal(false)
    setEditRuta(null)
  }

  useEffect(() => { setPage(1) }, [filter, debouncedSearch, sortKey, sortDir])
  useEscapeKey(() => { setShowModal(false); setSelected(null); setShowEditModal(false) })

  return (
    <div className="space-y-6">

      <PageHeader
        breadcrumb="Rutas"
        title="Rutas de Distribución"
        subtitle="Control y seguimiento en tiempo real de todas las rutas de reparto"
      >
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Nueva ruta
        </button>
      </PageHeader>

      <KpiBar items={[
        { label: 'Total rutas',  value: data.length,                                            sub: 'registradas' },
        { label: 'En proceso',   value: enProceso,                                              sub: 'activas ahora' },
        { label: 'Finalizadas',  value: finalizadas, good: finalizadas > 0,                    sub: 'hoy' },
        { label: 'Pendientes',   value: pendientes,                                             sub: 'por salir' },
        { label: 'Canceladas',   value: canceladas, alert: canceladas > 0,                     sub: 'requieren revisión' },
      ]} />

      {/* ══ Resumen visual ════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Clientes visitados por ruta */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 flex-shrink-0" style={{ color: '#F97316' }} />
            <span className="text-sm font-bold" style={{ color: '#263442' }}>Cobertura de clientes</span>
            <span className="text-xs ml-auto" style={{ color: '#8FA1B2' }}>visitados / total</span>
          </div>
          <ResponsiveContainer width="100%" height={148}>
            <BarChart data={data.map(r => ({ name: r.nombre.replace('Ruta ', ''), visitados: r.clientesVisitados, pendientes: r.clientesTotal - r.clientesVisitados }))} barSize={14} barGap={2} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#FDE8D0" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#8FA1B2' }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: '#FFF7ED' }}
                content={({ active, payload, label }) => active && payload?.length ? (
                  <div style={{ background: '#fff', border: '1px solid #FDE8D0', borderRadius: 10, padding: '6px 12px', boxShadow: '0 4px 16px rgba(249,115,22,.12)' }}>
                    <p style={{ fontSize: 10, color: '#8FA1B2', fontWeight: 700 }}>{label}</p>
                    {payload.map(p => <p key={p.name} style={{ fontSize: 12, color: p.fill, fontWeight: 700 }}>{p.name === 'visitados' ? 'Visitados' : 'Pendientes'}: {p.value}</p>)}
                  </div>
                ) : null}
              />
              <Bar dataKey="visitados" radius={[4, 4, 0, 0]} fill="#F97316" name="visitados" />
              <Bar dataKey="pendientes" radius={[4, 4, 0, 0]} fill="#FDBA74" name="pendientes" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Estado de rutas */}
        <div className="card p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Map className="w-4 h-4 flex-shrink-0" style={{ color: '#F97316' }} />
            <span className="text-sm font-bold" style={{ color: '#263442' }}>Estado de rutas</span>
          </div>
          <div className="flex flex-col gap-3 flex-1 justify-center">
            {[
              { label: 'En proceso',  count: enProceso,                                            color: '#d97706', bg: 'rgba(217,119,6,.1)' },
              { label: 'Finalizadas', count: finalizadas,                                          color: '#059669', bg: 'rgba(5,150,105,.1)' },
              { label: 'Pendientes',  count: pendientes,                                           color: '#8FA1B2', bg: '#F2F3F5' },
              { label: 'Canceladas',  count: canceladas,                                           color: '#C97A6D', bg: 'rgba(201,122,109,.1)' },
            ].map(s => {
              const pct = Math.round(s.count / data.length * 100)
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
                      <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: s.color }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-4 pt-4 flex items-center justify-between" style={{ borderTop: '1px solid #FDE8D0' }}>
            <span className="text-xs" style={{ color: '#8FA1B2' }}>Ventas totales</span>
            <span className="text-sm font-black" style={{ color: '#F97316' }}>{fmt(totalVentas)}</span>
          </div>
        </div>
      </div>

      {/* ── TABLE / CARDS ── */}
      {!loaded ? <SkeletonTableRows /> : <>
      <div className="card overflow-hidden mb-5 hidden lg:block">
        <div className="data-toolbar">
          <div className="data-toolbar-row">
            <SearchInput value={search} onChange={setSearch} placeholder="Buscar ruta o distribuidor..." resultCount={filtered.length} />
            <div className="filter-bar flex-wrap">
              {['Todas', 'En proceso', 'Finalizada', 'Pendiente', 'Cancelada'].map(s => (
                <button key={s} onClick={() => setFilter(s)} className={`chip ${filter === s ? 'active' : ''}`}
                  style={s === 'Cancelada' && filter === s ? { background: 'rgba(201,122,109,.15)', color: '#A05A52', borderColor: 'rgba(201,122,109,.35)' } : {}}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="section-head">
          <div className="flex items-center gap-2">
            <Map className="w-4 h-4 flex-shrink-0" style={{ color: '#d97706' }} />
            <span className="section-head-text"><strong>Rutas de Distribución</strong></span>
            <span style={{ fontSize: '.7rem', color: '#8FA1B2' }}>{filtered.length} ruta{filtered.length !== 1 ? 's' : ''}</span>
            <span className="badge" style={{ background: 'rgba(217,119,6,.1)', color: '#d97706' }}>{enProceso} en proceso</span>
            <span className="badge" style={{ background: 'rgba(5,150,105,.1)', color: '#059669' }}>{finalizadas} finalizadas</span>
            {canceladas > 0 && (
              <span className="badge" style={{ background: 'rgba(201,122,109,.1)', color: '#A05A52' }}>{canceladas} canceladas</span>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="table-modern">
            <thead>
              <tr>
                <th>ID</th>
                <SortTh col="nombre" label="Ruta" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortTh col="distribuidor" label="Distribuidor" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <th>Vehículo</th>
                <th>Salida</th>
                <th>Clientes</th>
                <th>Progreso</th>
                <th>Ventas</th>
                <SortTh col="status" label="Estado" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(r => {
                const SIcon = statusIcon[r.status] || Clock
                const progress = r.clientesTotal > 0 ? (r.clientesVisitados / r.clientesTotal) * 100 : 0
                const isCancelled = r.status === 'Cancelada'
                return (
                  <tr
                    key={r.id}
                    style={isCancelled ? { background: 'rgba(201,122,109,.04)', borderLeft: '3px solid rgba(201,122,109,.35)' } : {}}
                  >
                    <td><span className="folio">{r.id}</span></td>
                    <td>
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={iconBg[r.status]}>
                          <SIcon className="w-4 h-4" style={{ color: iconBg[r.status].color }} />
                        </div>
                        <span className="font-semibold truncate" style={{ color: '#263442' }}>{r.nombre}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#F97316' }} />
                        <span style={{ color: '#627080' }}>{r.distribuidor}</span>
                      </div>
                    </td>
                    <td><span className="font-mono text-xs" style={{ color: '#8FA1B2' }}>{r.vehiculo}</span></td>
                    <td><span style={{ color: '#627080' }}>{r.salida}</span></td>
                    <td>
                      <span className="font-semibold" style={{ color: '#627080' }}>{r.clientesVisitados}</span>
                      <span style={{ color: '#8FA1B2' }}>/{r.clientesTotal}</span>
                    </td>
                    <td className="w-28">
                      <div className="progress-track">
                        <div
                          className={`progress-fill ${progress === 100 ? 'progress-fill-green' : progress > 0 ? 'progress-fill-orange' : ''}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: '#8FA1B2' }}>{Math.round(progress)}%</p>
                    </td>
                    <td>
                      <span className="font-bold" style={{ color: r.ventas > 0 ? '#059669' : '#8FA1B2' }}>{fmt(r.ventas)}</span>
                    </td>
                    <td><Badge label={r.status} color={statusColor[r.status]} /></td>
                    <td>
                      <div className="flex gap-1">
                        <button className="action-btn" title="Ver detalles" onClick={() => setSelected(r)}>
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="action-btn" title="Editar" onClick={() => openEdit(r)}>
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="action-btn danger"
                          title="Eliminar"
                          onClick={() => setConfirmDel(r)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10}>
                    <EmptyState icon={Map} title="Sin rutas" subtitle="No hay rutas con el filtro seleccionado.">
                      <button onClick={() => { setFilter('Todas') }} className="btn-soft-blue mt-3 px-4 py-2 text-xs font-semibold rounded-xl">
                        Ver todas las rutas
                      </button>
                    </EmptyState>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination total={sorted.length} page={page} perPage={PER_PAGE} onChange={setPage} />
      </div>

      {/* ── MOBILE TOOLBAR ── */}
      <div className="card overflow-hidden lg:hidden">
        <div className="data-toolbar">
          <div className="data-toolbar-row">
            <SearchInput value={search} onChange={setSearch} placeholder="Buscar ruta o distribuidor..." resultCount={filtered.length} />
            <div className="filter-bar flex-wrap">
              {['Todas', 'En proceso', 'Finalizada', 'Pendiente', 'Cancelada'].map(s => (
                <button key={s} onClick={() => setFilter(s)} className={`chip ${filter === s ? 'active' : ''}`}
                  style={s === 'Cancelada' && filter === s ? { background: 'rgba(201,122,109,.15)', color: '#A05A52', borderColor: 'rgba(201,122,109,.35)' } : {}}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── CARDS (mobile / tablet) ── */}
      <div className="grid grid-cols-1 lg:hidden gap-4">
        {filtered.map((r, i) => {
          const SIcon = statusIcon[r.status] || Clock
          const progress = r.clientesTotal > 0 ? (r.clientesVisitados / r.clientesTotal) * 100 : 0
          const isCancelled = r.status === 'Cancelada'
          return (
            <div
              key={r.id}
              className="card p-5 animate-fade-in-up"
              style={{ animationDelay: `${Math.min(i * 60, 200)}ms`, ...(isCancelled ? { borderColor: 'rgba(201,122,109,.3)' } : {}) }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={iconBg[r.status]}>
                    <SIcon className="w-5 h-5" style={{ color: iconBg[r.status].color }} />
                  </div>
                  <div>
                    <p className="font-bold" style={{ color: '#263442' }}>{r.nombre}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="folio">{r.id}</span>
                      <span className="text-xs" style={{ color: '#8FA1B2' }}>{r.vehiculo}</span>
                    </div>
                  </div>
                </div>
                <Badge label={r.status} color={statusColor[r.status]} />
              </div>

              <div
                className="flex items-center gap-2 mb-4 rounded-xl p-3"
                style={{ background: '#FFF7ED', border: '1px solid #FDBA74' }}
              >
                <Truck className="w-4 h-4 flex-shrink-0" style={{ color: '#F97316' }} />
                <span className="text-sm font-medium" style={{ color: '#627080' }}>{r.distribuidor}</span>
              </div>

              {!isCancelled && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1.5" style={{ color: '#8FA1B2' }}>
                    <span>Clientes visitados</span>
                    <span className="font-semibold">{r.clientesVisitados}/{r.clientesTotal}</span>
                  </div>
                  <div className="progress-track">
                    <div
                      className={`progress-fill ${progress === 100 ? 'progress-fill-green' : progress > 0 ? 'progress-fill-orange' : ''}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {isCancelled && (
                <div className="mb-4 rounded-xl px-3 py-2.5 flex items-center gap-2" style={{ background: 'rgba(201,122,109,.08)', border: '1px solid rgba(201,122,109,.2)' }}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#C97A6D' }} />
                  <p className="text-xs font-semibold" style={{ color: '#A05A52' }}>Ruta cancelada · sin actividad</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 mb-4">
                {[['Salida', r.salida], ['Llegada', r.llegada], ['Cierre', r.cierre]].map(([label, val]) => (
                  <div key={label} className="text-center rounded-xl p-2" style={{ background: '#F2F3F5' }}>
                    <p className="text-xs mb-0.5" style={{ color: '#8FA1B2' }}>{label}</p>
                    <p className="text-sm font-semibold" style={{ color: '#627080' }}>{val}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  ['Ventas',      fmt(r.ventas),       r.ventas > 0 ? '#059669' : '#8FA1B2'],
                  ['Cobros',      fmt(r.cobros),        r.cobros > 0 ? '#F97316' : '#8FA1B2'],
                  ['Devoluciones',fmt(r.devoluciones),  r.devoluciones > 0 ? '#C97A6D' : '#8FA1B2'],
                ].map(([label, val, col]) => (
                  <div key={label} className="text-center">
                    <p className="text-xs mb-0.5" style={{ color: '#8FA1B2' }}>{label}</p>
                    <p className="text-sm font-bold" style={{ color: col }}>{val}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setSelected(r)}
                className="btn-soft-blue w-full py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" /> Ver detalles de ruta
              </button>
            </div>
          )
        })}
      </div>
      </>}

      {/* ── MODAL: Detalle ruta ── */}
      {selected && (
        <Modal maxWidth="lg" onClose={() => setSelected(null)} header={<div><h3 className="font-bold" style={{ color: '#263442' }}>{selected.nombre}</h3><div className="flex items-center gap-2 mt-1"><span className="folio">{selected.id}</span><span className="text-xs" style={{ color: '#8FA1B2' }}>{selected.vehiculo}</span></div></div>}>
            <div className="p-6 space-y-4">
              {selected.status === 'Cancelada' && (
                <div className="flex items-center gap-2.5 rounded-xl px-3 py-2.5" style={{ background: 'rgba(201,122,109,.08)', border: '1px solid rgba(201,122,109,.25)' }}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#C97A6D' }} />
                  <p className="text-xs font-semibold" style={{ color: '#A05A52' }}>Esta ruta fue cancelada y no tiene actividad registrada</p>
                </div>
              )}
              <div
                className="flex items-center gap-2 rounded-xl p-3"
                style={{ background: '#FFF7ED', border: '1px solid #FDBA74' }}
              >
                <Truck className="w-4 h-4 flex-shrink-0" style={{ color: '#F97316' }} />
                <span className="text-sm font-medium" style={{ color: '#627080' }}>{selected.distribuidor}</span>
                <Badge label={selected.status} color={statusColor[selected.status]} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[['Salida', selected.salida], ['Llegada', selected.llegada], ['Cierre', selected.cierre]].map(([label, val]) => (
                  <InfoCell key={label} label={label} value={val} center />
                ))}
              </div>
              {selected.status !== 'Cancelada' && (
                <div>
                  <div className="flex justify-between text-xs mb-1.5" style={{ color: '#8FA1B2' }}>
                    <span>Clientes visitados</span>
                    <span className="font-semibold">{selected.clientesVisitados}/{selected.clientesTotal}</span>
                  </div>
                  <div className="progress-track">
                    <div
                      className={`progress-fill ${selected.clientesVisitados === selected.clientesTotal ? 'progress-fill-green' : 'progress-fill-orange'}`}
                      style={{ width: `${selected.clientesTotal > 0 ? (selected.clientesVisitados / selected.clientesTotal) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              )}
              <div className="grid grid-cols-3 gap-3">
                {[
                  ['Ventas',       fmt(selected.ventas),       selected.ventas > 0 ? '#059669' : '#8FA1B2'],
                  ['Cobros',       fmt(selected.cobros),        selected.cobros > 0 ? '#F97316' : '#8FA1B2'],
                  ['Devoluciones', fmt(selected.devoluciones),  selected.devoluciones > 0 ? '#C97A6D' : '#8FA1B2'],
                ].map(([label, val, col]) => (
                  <InfoCell key={label} label={label} value={val} color={col} bold center />
                ))}
              </div>
            </div>
            <div className="modal-footer px-6 py-4 flex justify-end" style={{ borderTop: '1px solid #FDE8D0' }}>
              <button onClick={() => setSelected(null)} className="btn-secondary">Cerrar</button>
            </div>
        </Modal>
      )}

      {/* ── CONFIRM: Eliminar ruta ── */}
      {confirmDel && (
        <ConfirmDialog
          title="¿Eliminar esta ruta?"
          message={`La ruta "${confirmDel.nombre}" (${confirmDel.id}) será eliminada permanentemente del sistema.`}
          confirmLabel="Sí, eliminar"
          onConfirm={() => deleteRuta(confirmDel)}
          onCancel={() => setConfirmDel(null)}
        />
      )}

      {/* ── MODAL: Editar ruta ── */}
      {showEditModal && editRuta && (
        <Modal title="Editar ruta" subtitle={editRuta.id} maxWidth="lg" onClose={() => setShowEditModal(false)}>
            <div className="p-6 space-y-4">
              <FormField label="Nombre de la ruta" required error={editErrors.nombre}>
                <input
                  type="text"
                  value={editForm.nombre}
                  onChange={e => { setEditForm(f => ({ ...f, nombre: e.target.value })); setEditErrors(er => ({ ...er, nombre: '' })) }}
                  className={`input-field ${editErrors.nombre ? 'input-field-error' : ''}`}
                  autoFocus
                />
              </FormField>
              <FormField label="Distribuidor asignado" required error={editErrors.distribuidor}>
                <select
                  value={editForm.distribuidor}
                  onChange={e => { setEditForm(f => ({ ...f, distribuidor: e.target.value })); setEditErrors(er => ({ ...er, distribuidor: '' })) }}
                  className={`input-field ${editErrors.distribuidor ? 'input-field-error' : ''}`}
                >
                  <option value="">Seleccionar distribuidor</option>
                  {['Juan Pérez', 'Carlos López', 'Mario García', 'Luis Martínez', 'Roberto Cruz'].map(d => <option key={d}>{d}</option>)}
                </select>
              </FormField>
              <FormField label="Vehículo" required error={editErrors.vehiculo}>
                <input
                  type="text"
                  placeholder="Ej: JAL-123-B"
                  value={editForm.vehiculo}
                  onChange={e => { setEditForm(f => ({ ...f, vehiculo: e.target.value })); setEditErrors(er => ({ ...er, vehiculo: '' })) }}
                  className={`input-field ${editErrors.vehiculo ? 'input-field-error' : ''}`}
                />
              </FormField>
              <FormField label="Hora de salida programada">
                <input
                  type="time"
                  value={editForm.salida}
                  onChange={e => setEditForm(f => ({ ...f, salida: e.target.value }))}
                  className="input-field"
                />
              </FormField>
            </div>
            <ModalFooter onCancel={() => setShowEditModal(false)} onConfirm={handleSaveEdit} confirmLabel="Guardar cambios" />
        </Modal>
      )}

      {/* ── MODAL: Nueva ruta ── */}
      {showModal && (
        <Modal title="Nueva ruta" maxWidth="lg" shake={shake} onClose={() => { setShowModal(false); setRutaForm(BLANK_RUTA); setRutaErrors({}) }}>
            <div className="p-6 space-y-4">
              <FormField label="Nombre de la ruta" required error={rutaErrors.nombre}>
                <input
                  type="text"
                  placeholder="Ej: Ruta Norte"
                  value={rutaForm.nombre}
                  onChange={e => { setRutaForm(f => ({ ...f, nombre: e.target.value })); setRutaErrors(er => ({ ...er, nombre: '' })) }}
                  className={`input-field ${rutaErrors.nombre ? 'input-field-error' : ''}`}
                  autoFocus
                />
              </FormField>
              <FormField label="Distribuidor asignado" required error={rutaErrors.distribuidor}>
                <select
                  value={rutaForm.distribuidor}
                  onChange={e => { setRutaForm(f => ({ ...f, distribuidor: e.target.value })); setRutaErrors(er => ({ ...er, distribuidor: '' })) }}
                  className={`input-field ${rutaErrors.distribuidor ? 'input-field-error' : ''}`}
                >
                  <option value="">Seleccionar distribuidor</option>
                  {['Juan Pérez', 'Carlos López', 'Mario García', 'Luis Martínez', 'Roberto Cruz'].map(d => <option key={d}>{d}</option>)}
                </select>
              </FormField>
              <FormField label="Vehículo" required error={rutaErrors.vehiculo}>
                <input
                  type="text"
                  placeholder="Ej: JAL-123-B"
                  value={rutaForm.vehiculo}
                  onChange={e => { setRutaForm(f => ({ ...f, vehiculo: e.target.value })); setRutaErrors(er => ({ ...er, vehiculo: '' })) }}
                  className={`input-field ${rutaErrors.vehiculo ? 'input-field-error' : ''}`}
                />
              </FormField>
              <FormField label="Hora de salida programada">
                <input
                  type="time"
                  value={rutaForm.hora}
                  onChange={e => setRutaForm(f => ({ ...f, hora: e.target.value }))}
                  className="input-field"
                />
              </FormField>
            </div>
            <ModalFooter onCancel={() => { setShowModal(false); setRutaForm(BLANK_RUTA); setRutaErrors({}) }} onConfirm={handleCrearRuta} confirmLabel="Crear ruta" />
        </Modal>
      )}
    </div>
  )
}
